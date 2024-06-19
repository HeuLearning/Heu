export interface AssessmentHistory {
  id: string;
  num_attempts: number;
  questions: Array<string>,
  scores: Array<string>
}