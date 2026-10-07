CREATE TABLE app_user (
    id    BIGINT       NOT NULL AUTO_INCREMENT,
    name  VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role  VARCHAR(20)  NOT NULL,
    CONSTRAINT pk_app_user PRIMARY KEY (id),
    CONSTRAINT uk_app_user_email UNIQUE (email)
);

CREATE TABLE project (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    name        VARCHAR(120)  NOT NULL,
    description VARCHAR(2000),
    group_size  INT           NOT NULL,
    teacher_id  BIGINT        NOT NULL,
    created_at  DATETIME(6)   NOT NULL,
    CONSTRAINT pk_project PRIMARY KEY (id),
    CONSTRAINT fk_project_teacher FOREIGN KEY (teacher_id) REFERENCES app_user (id)
);

CREATE TABLE project_group (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    group_number INT  NOT NULL,
    CONSTRAINT pk_project_group PRIMARY KEY (id),
    CONSTRAINT fk_project_group_project FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    CONSTRAINT uk_project_group_number UNIQUE (project_id, group_number)
);

CREATE TABLE project_group_member (
    group_id   BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    CONSTRAINT pk_project_group_member PRIMARY KEY (group_id, student_id),
    CONSTRAINT fk_member_group FOREIGN KEY (group_id) REFERENCES project_group (id) ON DELETE CASCADE,
    CONSTRAINT fk_member_student FOREIGN KEY (student_id) REFERENCES app_user (id)
);
