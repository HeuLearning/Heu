import type { Text } from "./text"
import type { SuggestionModel } from "./suggestion-model";


export default interface TextWithSuggestions {
  0: Text;
  1: Array<SuggestionModel>
}