import type { User } from "./user";
export interface CommentModel {
  body: string;
  commenter: User;
}