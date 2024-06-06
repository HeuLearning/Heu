import { type WordProbabilityModel } from "./WordProbabilityModel";

export interface PotentialSuggestionModel {
    suggestions: Array<WordProbabilityModel>
    original_text: string;
}