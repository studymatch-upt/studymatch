#!/usr/bin/env bash
#
# StudyMatch API smoke test.
#
#   1. wipes the MySQL database (docker container group-matcher-mysql, database group_matcher)
#   2. starts the backend, so Flyway + Hibernate recreate the schema and the demo data is seeded
#   3. calls every endpoint, valid and invalid, and checks the HTTP status of each call
#   4. writes request, status and response of every call to scripts/output/api-test-results.txt
#   5. stops the backend again
#
# Run it from anywhere:   ./scripts/api-smoke-test.sh
# Stop the backend (and anything else on :8080) before running it.
# Set SKIP_SETUP=1 to skip steps 1, 2 and 5 and test an already running backend (the results
# only make sense on a freshly wiped database, so expect some FAIL lines in that case).

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="$SCRIPT_DIR/output"
OUT="$OUT_DIR/api-test-results.txt"
BACKEND_LOG="$OUT_DIR/backend.log"
BASE="${BASE_URL:-http://localhost:8080}"
DB_CONTAINER="group-matcher-mysql"
DB_NAME="group_matcher"
DB_ROOT_PASSWORD="root"          # MYSQL_ROOT_PASSWORD in docker-compose.yml
SKIP_SETUP="${SKIP_SETUP:-0}"

mkdir -p "$OUT_DIR"
: > "$OUT"

BACKEND_PID=""
TMP_BODY="$(mktemp)"
TMP_HDR="$(mktemp)"

cleanup() {
    rm -f "$TMP_BODY" "$TMP_HDR"
    if [[ -n "$BACKEND_PID" ]]; then
        echo "Stopping backend (pid $BACKEND_PID)..."
        kill -TERM -- "-$BACKEND_PID" 2>/dev/null || kill -TERM "$BACKEND_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

die() { echo "ERROR: $*" >&2; exit 2; }

command -v curl >/dev/null || die "curl is not installed"
command -v python3 >/dev/null || die "python3 is not installed (used to pretty-print JSON)"

# ---------------------------------------------------------------------------------------------
# 1 + 2. Reset the database and start the backend
# ---------------------------------------------------------------------------------------------
if [[ "$SKIP_SETUP" != "1" ]]; then
    command -v docker >/dev/null || die "docker is not installed"
    docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER" \
        || die "container $DB_CONTAINER is not running. Start it with: docker compose up -d"

    if (exec 3<>/dev/tcp/127.0.0.1/8080) 2>/dev/null; then
        die "something is already listening on port 8080. Stop the backend and run this again."
    fi

    echo "Wiping database $DB_NAME ..."
    docker exec "$DB_CONTAINER" mysql -uroot -p"$DB_ROOT_PASSWORD" \
        -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME;" 2>/dev/null \
        || die "could not recreate the database"

    echo "Starting backend (log: $BACKEND_LOG) ..."
    ( cd "$REPO_ROOT/backend" && exec setsid ./mvnw -q spring-boot:run ) > "$BACKEND_LOG" 2>&1 &
    BACKEND_PID=$!

    echo -n "Waiting for the backend"
    for _ in $(seq 1 180); do
        if curl -s "$BASE/actuator/health" 2>/dev/null | grep -q '"UP"'; then
            echo " - up."
            break
        fi
        if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            echo
            die "backend exited during startup, see $BACKEND_LOG"
        fi
        echo -n "."
        sleep 1
    done
    curl -s "$BASE/actuator/health" 2>/dev/null | grep -q '"UP"' || die "backend did not become healthy in 180 s, see $BACKEND_LOG"
fi

# ---------------------------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------------------------
PASS=0
FAIL=0
N=0
FAILED=()
LAST_LOCATION=""

section() {
    {
        printf '\n\n'
        printf '################################################################################\n'
        printf '# %s\n' "$1"
        printf '################################################################################\n'
    } >> "$OUT"
    echo "== $1"
}

pretty_body() {
    if [[ -s "$TMP_BODY" ]]; then
        python3 -m json.tool --no-ensure-ascii "$TMP_BODY" 2>/dev/null || cat "$TMP_BODY"
        echo
    else
        echo "(empty body)"
    fi
}

# call "<name>" <expected status> <METHOD> <path> ['<json body>']
call() {
    local name="$1" expected="$2" method="$3" path="$4" body="${5:-}"
    local args=(-s -o "$TMP_BODY" -D "$TMP_HDR" -w '%{http_code}' -X "$method" "$BASE$path")
    if [[ -n "$body" ]]; then
        args+=(-H 'Content-Type: application/json' --data "$body")
    fi

    local status
    status="$(curl "${args[@]}" 2>/dev/null)" || status="000"
    LAST_LOCATION="$(tr -d '\r' < "$TMP_HDR" | awk 'tolower($1)=="location:" {print $2}')"

    N=$((N + 1))
    local verdict="PASS"
    if [[ "$status" != "$expected" ]]; then
        verdict="FAIL"
        FAIL=$((FAIL + 1))
        FAILED+=("#$N $name (expected $expected, got $status)")
    else
        PASS=$((PASS + 1))
    fi

    {
        printf -- '--------------------------------------------------------------------------------\n'
        printf '[%s] #%d  %s\n' "$verdict" "$N" "$name"
        if [[ -n "$body" ]]; then
            printf "curl -X %s '%s%s' -H 'Content-Type: application/json' -d '%s'\n" "$method" "$BASE" "$path" "$body"
        else
            printf "curl -X %s '%s%s'\n" "$method" "$BASE" "$path"
        fi
        printf 'expected HTTP %s, got HTTP %s\n' "$expected" "$status"
        [[ -n "$LAST_LOCATION" ]] && printf 'Location: %s\n' "$LAST_LOCATION"
        printf 'response:\n'
        pretty_body
    } >> "$OUT"

    printf '  [%s] #%-3d %s\n' "$verdict" "$N" "$name"
}

id_from_location() { echo "${LAST_LOCATION##*/}"; }

# ---------------------------------------------------------------------------------------------
# Known ids on a freshly seeded database (see db/seed/V100__seed_demo_users.sql)
# ---------------------------------------------------------------------------------------------
TEACHER_ANA=1
TEACHER_BRUNO=2
CARLA=3      # demo student with academic history
DIOGO=4      # demo student, questionnaire only
EVA=5        # demo student without any data
NO_SUCH=999999

{
    echo "StudyMatch API smoke test"
    echo "date:     $(date -Is)"
    echo "base url: $BASE"
    echo "Every call lists the expected HTTP status; PASS/FAIL compares it with the real one."
} >> "$OUT"

# =============================================================================================
section "USERS  GET /api/users"
# =============================================================================================
call "list teachers"                       200 GET "/api/users?role=TEACHER"
call "list students"                       200 GET "/api/users?role=STUDENT"
call "unknown role value"                  400 GET "/api/users?role=ADMIN"
call "missing role parameter"              400 GET "/api/users"

# =============================================================================================
section "PROJECTS  POST/GET /api/projects"
# =============================================================================================
TEN='[3,4,5,6,7,8,9,10,11,12]'
call "create project: 10 students, size 3 (expect groups 3/3/2/2)" 201 POST /api/projects \
    '{"name":"Software Quality","description":"smoke test","groupSize":3,"teacherId":'"$TEACHER_ANA"',"studentIds":'"$TEN"'}'
PROJECT_ID="$(id_from_location)"
call "create project: no description"      201 POST /api/projects \
    '{"name":"No description","groupSize":2,"teacherId":'"$TEACHER_ANA"',"studentIds":[3,4,5]}'
call "create project: group size 1"        201 POST /api/projects \
    '{"name":"Solo","groupSize":1,"teacherId":'"$TEACHER_ANA"',"studentIds":[3,4]}'
call "create project: size larger than selection (one group)" 201 POST /api/projects \
    '{"name":"Big groups","groupSize":50,"teacherId":'"$TEACHER_BRUNO"',"studentIds":[3,4,5]}'
call "create project: blank name"          400 POST /api/projects \
    '{"name":"   ","groupSize":3,"teacherId":'"$TEACHER_ANA"',"studentIds":[3,4,5]}'
call "create project: group size 0"        400 POST /api/projects \
    '{"name":"X","groupSize":0,"teacherId":'"$TEACHER_ANA"',"studentIds":[3,4,5]}'
call "create project: group size 51"       400 POST /api/projects \
    '{"name":"X","groupSize":51,"teacherId":'"$TEACHER_ANA"',"studentIds":[3,4,5]}'
call "create project: missing teacherId"   400 POST /api/projects \
    '{"name":"X","groupSize":3,"studentIds":[3,4,5]}'
call "create project: empty student list"  400 POST /api/projects \
    '{"name":"X","groupSize":3,"teacherId":'"$TEACHER_ANA"',"studentIds":[]}'
call "create project: unknown teacher"     404 POST /api/projects \
    '{"name":"X","groupSize":3,"teacherId":'"$NO_SUCH"',"studentIds":[3,4,5]}'
call "create project: creator is a student" 422 POST /api/projects \
    '{"name":"X","groupSize":3,"teacherId":'"$CARLA"',"studentIds":[4,5,6]}'
call "create project: unknown student"     404 POST /api/projects \
    '{"name":"X","groupSize":3,"teacherId":'"$TEACHER_ANA"',"studentIds":[3,4,'"$NO_SUCH"']}'
call "create project: teacher among students" 422 POST /api/projects \
    '{"name":"X","groupSize":3,"teacherId":'"$TEACHER_ANA"',"studentIds":[3,4,'"$TEACHER_BRUNO"']}'
call "create project: same student twice"  422 POST /api/projects \
    '{"name":"X","groupSize":3,"teacherId":'"$TEACHER_ANA"',"studentIds":[3,3,4]}'
call "create project: malformed JSON"      400 POST /api/projects '{"name":'
call "list projects of Ana"                200 GET "/api/projects?teacherId=$TEACHER_ANA"
call "list projects of Bruno"              200 GET "/api/projects?teacherId=$TEACHER_BRUNO"
call "list projects of unknown teacher (empty)" 200 GET "/api/projects?teacherId=$NO_SUCH"
call "list projects: missing teacherId"    400 GET "/api/projects"
call "get project"                         200 GET "/api/projects/$PROJECT_ID"
call "get unknown project"                 404 GET "/api/projects/$NO_SUCH"
call "get project: non-numeric id"         400 GET "/api/projects/abc"

# =============================================================================================
section "STUDENTS (2.1)  /api/students"
# =============================================================================================
call "create student"                      201 POST /api/students \
    '{"name":"Script Student","email":"script.student@school.test","studentNumber":"A90001","curricularYear":2}'
S1="$(id_from_location)"
call "create second student"               201 POST /api/students \
    '{"name":"Second Student","email":"second.student@school.test","studentNumber":"A90002","curricularYear":3}'
S2="$(id_from_location)"
call "create student: duplicate email in other case (emails are normalised)" 409 POST /api/students \
    '{"name":"Dup","email":"SCRIPT.STUDENT@school.test","studentNumber":"A90003","curricularYear":2}'
call "create student: duplicate email"     409 POST /api/students \
    '{"name":"Dup","email":"script.student@school.test","studentNumber":"A90003","curricularYear":2}'
call "create student: duplicate student number" 409 POST /api/students \
    '{"name":"Dup","email":"dup@school.test","studentNumber":"A90001","curricularYear":2}'
call "create student: invalid email"       400 POST /api/students \
    '{"name":"Bad","email":"not-an-email","studentNumber":"A90004","curricularYear":2}'
call "create student: blank name"          400 POST /api/students \
    '{"name":"","email":"blank@school.test","studentNumber":"A90005","curricularYear":2}'
call "create student: invalid student number" 400 POST /api/students \
    '{"name":"Bad","email":"bad.number@school.test","studentNumber":"bad number!","curricularYear":2}'
call "create student: curricular year 0"   400 POST /api/students \
    '{"name":"Bad","email":"year0@school.test","studentNumber":"A90006","curricularYear":0}'
call "create student: curricular year 6"   400 POST /api/students \
    '{"name":"Bad","email":"year6@school.test","studentNumber":"A90007","curricularYear":6}'
call "create student: missing fields"      400 POST /api/students '{}'

call "list students (default order)"       200 GET "/api/students"
call "list students: search by name"       200 GET "/api/students?search=carla"
call "list students: search by email"      200 GET "/api/students?search=second.student"
call "list students: search by number"     200 GET "/api/students?search=A9000"
call "list students: search, no match"     200 GET "/api/students?search=zzzzzz"
call "list students: filter year 2"        200 GET "/api/students?curricularYear=2"
call "list students: sort name desc"       200 GET "/api/students?sortBy=name&direction=desc"
call "list students: sort email asc"       200 GET "/api/students?sortBy=email&direction=asc"
call "list students: sort studentNumber desc" 200 GET "/api/students?sortBy=studentNumber&direction=desc"
call "list students: sort curricularYear asc" 200 GET "/api/students?sortBy=curricularYear&direction=asc"
call "list students: search + year + sort" 200 GET "/api/students?search=student&curricularYear=3&sortBy=name&direction=asc"
call "list students: unknown sort field"   422 GET "/api/students?sortBy=password"
call "list students: unknown direction"    422 GET "/api/students?direction=sideways"
call "list students: curricularYear 0"     422 GET "/api/students?curricularYear=0"
call "list students: curricularYear -1"    422 GET "/api/students?curricularYear=-1"
call "list students: curricularYear text"  400 GET "/api/students?curricularYear=abc"

call "get student"                         200 GET "/api/students/$S1"
call "get unknown student"                 404 GET "/api/students/$NO_SUCH"
call "get student: id of a teacher"        404 GET "/api/students/$TEACHER_ANA"
call "get student: non-numeric id"         400 GET "/api/students/abc"

call "update student"                      200 PUT "/api/students/$S1" \
    '{"name":"Script Student Renamed","email":"script.student@school.test","studentNumber":"A90001","curricularYear":3}'
call "update student: keep own email and number (not a duplicate of itself)" 200 PUT "/api/students/$S1" \
    '{"name":"Script Student Renamed","email":"script.student@school.test","studentNumber":"A90001","curricularYear":3}'
call "update student: email of another student" 409 PUT "/api/students/$S1" \
    '{"name":"X","email":"second.student@school.test","studentNumber":"A90001","curricularYear":3}'
call "update student: number of another student" 409 PUT "/api/students/$S1" \
    '{"name":"X","email":"script.student@school.test","studentNumber":"A90002","curricularYear":3}'
call "update student: invalid body"        400 PUT "/api/students/$S1" \
    '{"name":"","email":"nope","studentNumber":"","curricularYear":9}'
call "update unknown student"              404 PUT "/api/students/$NO_SUCH" \
    '{"name":"X","email":"x@school.test","studentNumber":"A90010","curricularYear":2}'
call "update student: id of a teacher"     404 PUT "/api/students/$TEACHER_ANA" \
    '{"name":"X","email":"x@school.test","studentNumber":"A90010","curricularYear":2}'

# =============================================================================================
section "COURSE UNITS (2.2)  /api/course-units"
# =============================================================================================
call "list seeded course units (6)"        200 GET "/api/course-units"
call "create course unit"                  201 POST /api/course-units \
    '{"code":"SCR1","name":"Script Unit One","curricularYear":3,"semester":1,"competencyWeights":{"PROGRAMMING":0.7,"MATHEMATICS_AND_LOGIC":0.3}}'
CU1="$(id_from_location)"
call "create course unit: lower-case code is stored upper-case" 201 POST /api/course-units \
    '{"code":"scr2","name":"  Script Unit Two  ","curricularYear":2,"semester":2,"competencyWeights":{"DATABASES":1.0}}'
call "create course unit: weight exactly 1.0 and a tiny weight" 201 POST /api/course-units \
    '{"code":"SCR3","name":"Edge weights","curricularYear":1,"semester":1,"competencyWeights":{"COMMUNICATION":0.01,"DESIGN_AND_UX":1.0}}'
call "create course unit: duplicate code (other case)" 409 POST /api/course-units \
    '{"code":"scr1","name":"Dup","curricularYear":1,"semester":1,"competencyWeights":{"PROGRAMMING":1.0}}'
call "create course unit: duplicate of a seeded code" 409 POST /api/course-units \
    '{"code":"aed","name":"Dup","curricularYear":1,"semester":1,"competencyWeights":{"PROGRAMMING":1.0}}'
call "create course unit: weight above 1"  400 POST /api/course-units \
    '{"code":"BAD1","name":"X","curricularYear":1,"semester":1,"competencyWeights":{"PROGRAMMING":1.5}}'
call "create course unit: weight 0"        400 POST /api/course-units \
    '{"code":"BAD2","name":"X","curricularYear":1,"semester":1,"competencyWeights":{"PROGRAMMING":0}}'
call "create course unit: negative weight" 400 POST /api/course-units \
    '{"code":"BAD3","name":"X","curricularYear":1,"semester":1,"competencyWeights":{"PROGRAMMING":-0.5}}'
call "create course unit: empty weights"   400 POST /api/course-units \
    '{"code":"BAD4","name":"X","curricularYear":1,"semester":1,"competencyWeights":{}}'
call "create course unit: weights missing" 400 POST /api/course-units \
    '{"code":"BAD5","name":"X","curricularYear":1,"semester":1}'
call "create course unit: unknown competency" 400 POST /api/course-units \
    '{"code":"BAD6","name":"X","curricularYear":1,"semester":1,"competencyWeights":{"JUGGLING":0.5}}'
call "create course unit: invalid code"    400 POST /api/course-units \
    '{"code":"bad code!","name":"X","curricularYear":1,"semester":1,"competencyWeights":{"PROGRAMMING":1.0}}'
call "create course unit: blank name"      400 POST /api/course-units \
    '{"code":"BAD7","name":" ","curricularYear":1,"semester":1,"competencyWeights":{"PROGRAMMING":1.0}}'
call "create course unit: year 0"          400 POST /api/course-units \
    '{"code":"BAD8","name":"X","curricularYear":0,"semester":1,"competencyWeights":{"PROGRAMMING":1.0}}'
call "create course unit: year 6"          400 POST /api/course-units \
    '{"code":"BAD9","name":"X","curricularYear":6,"semester":1,"competencyWeights":{"PROGRAMMING":1.0}}'
call "create course unit: semester 3"      400 POST /api/course-units \
    '{"code":"BAD10","name":"X","curricularYear":1,"semester":3,"competencyWeights":{"PROGRAMMING":1.0}}'
call "list course units (now 9)"           200 GET "/api/course-units"
call "get course unit"                     200 GET "/api/course-units/$CU1"
call "get unknown course unit"             404 GET "/api/course-units/$NO_SUCH"
call "get course unit: non-numeric id"     400 GET "/api/course-units/abc"

# =============================================================================================
section "PROFILE before any data  GET /api/students/{id}/profile"
# =============================================================================================
call "profile: student without data (all unknown, alpha 1.0)" 200 GET "/api/students/$S2/profile"
call "profile: Carla (history, AED counts once with 16, alpha 0.7)" 200 GET "/api/students/$CARLA/profile"
call "profile: Diogo (cold start, alpha 1.0)" 200 GET "/api/students/$DIOGO/profile"
call "profile: unknown student"            404 GET "/api/students/$NO_SUCH/profile"
call "profile: id of a teacher"            404 GET "/api/students/$TEACHER_ANA/profile"

# =============================================================================================
section "ENROLLMENTS (2.2)  /api/students/{id}/enrollments"
# =============================================================================================
E="/api/students/$S1/enrollments"
call "list enrollments: none yet"          200 GET "$E"
call "add enrollment: AED attempt 1 (failed)" 201 POST "$E" \
    '{"courseUnitCode":"AED","academicYear":2024,"attempt":1,"grade":8}'
ENR1="$(id_from_location)"
call "add enrollment: AED attempt 2 (repeated unit)" 201 POST "$E" \
    '{"courseUnitCode":"AED","academicYear":2025,"attempt":2,"grade":16}'
ENR2="$(id_from_location)"
call "add enrollment: lower-case code, decimal grade" 201 POST "$E" \
    '{"courseUnitCode":"bd","academicYear":2024,"attempt":1,"grade":14.5}'
ENR3="$(id_from_location)"
call "add enrollment: boundary grade 0"    201 POST "$E" \
    '{"courseUnitCode":"AM","academicYear":2024,"attempt":1,"grade":0}'
call "add enrollment: boundary grade 20"   201 POST "$E" \
    '{"courseUnitCode":"GP","academicYear":2025,"attempt":1,"grade":20}'
call "add enrollment: same attempt twice"  409 POST "$E" \
    '{"courseUnitCode":"AED","academicYear":2025,"attempt":2,"grade":10}'
call "add enrollment: unknown course unit" 404 POST "$E" \
    '{"courseUnitCode":"NOPE","academicYear":2025,"attempt":1,"grade":10}'
call "add enrollment: grade above 20"      400 POST "$E" \
    '{"courseUnitCode":"QS","academicYear":2025,"attempt":1,"grade":21}'
call "add enrollment: negative grade"      400 POST "$E" \
    '{"courseUnitCode":"QS","academicYear":2025,"attempt":1,"grade":-1}'
call "add enrollment: three decimals"      400 POST "$E" \
    '{"courseUnitCode":"QS","academicYear":2025,"attempt":1,"grade":15.555}'
call "add enrollment: attempt 0"           400 POST "$E" \
    '{"courseUnitCode":"QS","academicYear":2025,"attempt":0,"grade":10}'
call "add enrollment: academic year 1999"  400 POST "$E" \
    '{"courseUnitCode":"QS","academicYear":1999,"attempt":1,"grade":10}'
call "add enrollment: missing grade"       400 POST "$E" \
    '{"courseUnitCode":"QS","academicYear":2025,"attempt":1}'
call "add enrollment: blank course unit"   400 POST "$E" \
    '{"courseUnitCode":" ","academicYear":2025,"attempt":1,"grade":10}'
call "add enrollment: unknown student"     404 POST "/api/students/$NO_SUCH/enrollments" \
    '{"courseUnitCode":"AED","academicYear":2025,"attempt":1,"grade":10}'
call "add enrollment: id of a teacher"     404 POST "/api/students/$TEACHER_ANA/enrollments" \
    '{"courseUnitCode":"AED","academicYear":2025,"attempt":1,"grade":10}'
call "list enrollments (5, ordered by year/code/attempt)" 200 GET "$E"
call "list enrollments: unknown student"   404 GET "/api/students/$NO_SUCH/enrollments"
call "list enrollments: id of a teacher"   404 GET "/api/students/$TEACHER_ANA/enrollments"

# =============================================================================================
section "QUESTIONNAIRE (2.2)  /api/students/{id}/questionnaire"
# =============================================================================================
Q="/api/students/$S1/questionnaire"
call "get questionnaire: none yet"         200 GET "$Q"
call "put questionnaire: all six answers"  200 PUT "$Q" \
    '{"answers":{"PROGRAMMING":3,"MATHEMATICS_AND_LOGIC":4,"DATABASES":2,"DESIGN_AND_UX":5,"COMMUNICATION":1,"ORGANISATION_AND_LEADERSHIP":3}}'
call "get questionnaire"                   200 GET "$Q"
call "put questionnaire: replaces, only two answers left" 200 PUT "$Q" \
    '{"answers":{"PROGRAMMING":3,"COMMUNICATION":5}}'
call "get questionnaire after replace"     200 GET "$Q"
call "put questionnaire: answer 6"         400 PUT "$Q" '{"answers":{"PROGRAMMING":6}}'
call "put questionnaire: answer 0"         400 PUT "$Q" '{"answers":{"PROGRAMMING":0}}'
call "put questionnaire: answer not a number" 400 PUT "$Q" '{"answers":{"PROGRAMMING":"high"}}'
call "put questionnaire: null answer"      400 PUT "$Q" '{"answers":{"PROGRAMMING":null}}'
call "put questionnaire: empty answers"    400 PUT "$Q" '{"answers":{}}'
call "put questionnaire: answers missing"  400 PUT "$Q" '{}'
call "put questionnaire: unknown competency" 400 PUT "$Q" '{"answers":{"JUGGLING":3}}'
call "get questionnaire (unchanged by the rejected requests)" 200 GET "$Q"
call "put questionnaire: unknown student"  404 PUT "/api/students/$NO_SUCH/questionnaire" '{"answers":{"PROGRAMMING":3}}'
call "get questionnaire: unknown student"  404 GET "/api/students/$NO_SUCH/questionnaire"
call "put questionnaire: id of a teacher"  404 PUT "/api/students/$TEACHER_ANA/questionnaire" '{"answers":{"PROGRAMMING":3}}'
call "get questionnaire: id of a teacher"  404 GET "/api/students/$TEACHER_ANA/questionnaire"

# =============================================================================================
section "PROFILE with data, then changing and deleting grades"
# =============================================================================================
call "profile: questionnaire + 4 course units (AED counts as 16)" 200 GET "/api/students/$S1/profile"
call "update grade: AED attempt 2 from 16 to 17.5" 200 PUT "$E/$ENR2" '{"grade":17.5}'
call "profile after the grade change"      200 GET "/api/students/$S1/profile"
call "update grade: 25 rejected"           400 PUT "$E/$ENR2" '{"grade":25}'
call "update grade: negative rejected"     400 PUT "$E/$ENR2" '{"grade":-1}'
call "update grade: missing grade"         400 PUT "$E/$ENR2" '{}'
call "update grade: boundary 0"            200 PUT "$E/$ENR3" '{"grade":0}'
call "update grade: unknown enrollment"    404 PUT "$E/$NO_SUCH" '{"grade":10}'
call "update grade: enrollment 1 belongs to Carla, not to this student" 404 PUT "$E/1" '{"grade":10}'
call "update grade: non-numeric id"        400 PUT "$E/abc" '{"grade":10}'
call "delete enrollment: AED attempt 2 (attempt 1 becomes the latest)" 204 DELETE "$E/$ENR2"
call "profile after the delete (AED is 8 again)" 200 GET "/api/students/$S1/profile"
call "delete the same enrollment again"    404 DELETE "$E/$ENR2"
call "delete enrollment of another student" 404 DELETE "$E/1"
call "delete: non-numeric id"              400 DELETE "$E/abc"
call "list enrollments after deletes"      200 GET "$E"
call "re-add the deleted attempt (allowed again)" 201 POST "$E" \
    '{"courseUnitCode":"AED","academicYear":2025,"attempt":2,"grade":12}'
call "Carla's profile is unaffected"       200 GET "/api/students/$CARLA/profile"
call "Diogo's profile is unaffected"       200 GET "/api/students/$DIOGO/profile"
call "Eva (no data) profile"               200 GET "/api/students/$EVA/profile"

# =============================================================================================
# Summary
# =============================================================================================
{
    printf '\n\n'
    printf '################################################################################\n'
    printf '# SUMMARY: %d calls, %d PASS, %d FAIL\n' "$N" "$PASS" "$FAIL"
    printf '################################################################################\n'
    if (( FAIL > 0 )); then
        printf 'Failed calls:\n'
        printf '  %s\n' "${FAILED[@]}"
    fi
} >> "$OUT"

echo
echo "$N calls: $PASS PASS, $FAIL FAIL"
if (( FAIL > 0 )); then
    printf '  %s\n' "${FAILED[@]}"
fi
echo "Results written to $OUT"

(( FAIL == 0 ))
