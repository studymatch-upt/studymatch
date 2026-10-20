import { aggregateAnswers, competencies, type Competency } from './questionnaire.ts';
import type { QuestionnaireRecord } from './questionnaireStorage';

export type CompetencyScores = Partial<Record<Competency, number>>;
export type ApiProfile = {
  studentId: number;
  scores: CompetencyScores;
  questionnaireWeight: number;
  academicWeight: number;
  completedCourseUnits: number;
  unknownCompetencies: Competency[];
};

export type CompetencyProfile = {
  source: 'local' | 'official';
  scores: CompetencyScores;
  overallScore: number | null;
  questionnaireWeight: number | null;
  academicWeight: number | null;
  completedCourseUnits: number | null;
  unknownCompetencies: Competency[];
};

// One selector supplies the dashboard radar, large radar, and competency bars.
// A real API profile is accepted only after a legitimately associated student ID exists.
export function selectCompetencyProfile(record: QuestionnaireRecord, apiProfile?: ApiProfile, associatedStudentId?: number): CompetencyProfile | null {
  if (apiProfile && associatedStudentId && apiProfile.studentId === associatedStudentId) return {
    source: 'official', scores: apiProfile.scores,
    overallScore: null,
    questionnaireWeight: apiProfile.questionnaireWeight,
    academicWeight: apiProfile.academicWeight,
    completedCourseUnits: apiProfile.completedCourseUnits,
    unknownCompetencies: apiProfile.unknownCompetencies,
  };
  if (!record.completed) return null;
  const aggregated = aggregateAnswers(record.answers);
  return {
    source: 'local',
    scores: Object.fromEntries(competencies.map(({ key }) => [key, (aggregated[key] - 1) / 4 * 100])) as CompetencyScores,
    overallScore: null,
    questionnaireWeight: null,
    academicWeight: null,
    completedCourseUnits: null,
    unknownCompetencies: [],
  };
}
