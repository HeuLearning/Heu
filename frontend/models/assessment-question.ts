import type { jsonmodel } from "./json"
export interface AssessmentQuestion {
  done: boolean,
  question: {
    text: string,
    audio: string,
    image: string,
    json: jsonmodel,
  } | null,
  format: string | null,
}