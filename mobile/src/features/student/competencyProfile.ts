import { aggregateAnswers, competencies, type Competency } from './questionnaire.ts';
import type { QuestionnaireRecord } from './questionnaireStorage';

export type CompetencyScores = Partial<Record<Competency, number>>;
export type ApiProfile = {
  scores: CompetencyScores;
  questionnaireWeight: number;
  academicWeight: number;
  unknownCompetencies: Competency[];
};

export type CompetencyProfile = {
  source: 'local' | 'official';
  scores: CompetencyScores;
  questionnaireWeight: number | null;
  academicWeight: number | null;
  unknownCompetencies: Competency[];
};

// One selector supplies the dashboard radar, large radar, and competency bars.
// A real API profile is accepted only after a legitimately associated student ID exists.
export function selectCompetencyProfile(record: QuestionnaireRecord, apiProfile?: ApiProfile): CompetencyProfile | null {
  if (apiProfile) return {
    source: 'official', scores: apiProfile.scores,
    questionnaireWeight: apiProfile.questionnaireWeight,
    academicWeight: apiProfile.academicWeight,
    unknownCompetencies: apiProfile.unknownCompetencies,
  };
  if (!record.completed) return null;
  const aggregated = aggregateAnswers(record.answers);
  return {
    source: 'local',
    scores: Object.fromEntries(competencies.map(({ key }) => [key, (aggregated[key] - 1) / 4 * 100])) as CompetencyScores,
    questionnaireWeight: null,
    academicWeight: null,
    unknownCompetencies: [],
  };
}
