import type { User } from "./user"
export interface SuggestionModel {
      text: number;
      number_good: null | number;
      number_ok: null | number;
      number_bad: null | number;
      suggested_text: string;
      original_text: string;
      start_index: null | number;
      end_index: null | number;
      start_word: null | string;
      end_word: null | string;
      id: number;
      submitter: User;
      probability: number;
}