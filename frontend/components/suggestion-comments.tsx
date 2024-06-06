import React, { useState } from "react";
import { type SuggestionModel } from "models/suggestion-model";
import { useComment } from "~/pages/api/services/use-comments";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { useUser } from '@auth0/nextjs-auth0/client';
import { type CommentModel } from "models/comment"; 
import { CustomButton } from "./buttons/custom-button";
import { PageButton } from "./buttons/page-button";
import styles from "./SuggestionComments.module.css"


// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {
  suggestion: SuggestionModel,
  setFocusSuggestion: (s: SuggestionModel | null) => void;
  // suggestions: Array<SuggestionModel>;
  // setSuggestions: (suggestions: Array<SuggestionModel>) => void;
}; 

// Easiest way to declare a Function Component; return type is inferred.
const Comments = ( props: AppProps) => {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [reloadComments, setReloadComments] = useState<boolean>(false);

  const updateComment = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(event.target.value)
  }

  const { comments } = useComment({

    url: `/api/data/comments_get`,
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    data: {
      suggestion_id: props.suggestion.id,
      change: reloadComments,
    }
  }, reloadComments);



  const saveComment = async (): Promise<void> => {
    const config: AxiosRequestConfig = {
      url: `/api/data/comments_save`,
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      data: {
        suggestion_id: props.suggestion.id,
        comment: newComment 
      }
    };
    await axios(config);
    setNewComment('');
  }


  const deleteComment = async (comment: CommentModel): Promise<void> => {
    const config: AxiosRequestConfig = {
      url: `/api/data/comment_delete`,
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      data: {
        suggestion_id: props.suggestion.id,
        comment: comment 
      }
    };
    await axios(config);
    setNewComment('');
  }
 

  if (comments?.length === 0) {
    return (
      <div>
          <CustomButton onClick={() => props.setFocusSuggestion(null)} text='Back'></CustomButton>
          <div className={styles.noComments}>No Comments To Display</div>
          <div className={styles.newCommentContainer}>
            <textarea value={newComment} placeholder="Type Comment Here" onChange={updateComment}></textarea>
            <PageButton selected={false} onClick={() => {
              void saveComment().then(() => setReloadComments(!reloadComments))
            }} text='Submit Comment'></PageButton>
          </div>
      </div>
    )
  }

  return (
    <div>
      <CustomButton onClick={() => props.setFocusSuggestion(null)} text='Back'></CustomButton>
      <div className={styles.suggestionSectionContainer}>
        <div className={styles.suggestionTitle}>Suggestion:</div>
        <div className={styles.suggestionContainer}> 
          <div>Original Text: {props.suggestion.original_text}</div>
          <div>{`Logion's Suggestion "${props.suggestion.suggested_text}"`}</div>
          <div>Probability: {props.suggestion.probability}</div>
        </div>
      </div>
      <div>
        <div className={styles.commentsTitle}>Comments:</div>
        {comments && comments.map((c, i) => {
          return (
            <div key={i} className={styles.commentContainer}>
              <div className={styles.commentBody}>{comments && c.body}</div>
              <div className={styles.commentUser}>{comments && c.commenter.email}</div>
              {c.commenter.email === user.email && <CustomButton onClick={() => void deleteComment(c).then(() => setReloadComments(!reloadComments))} text='Delete'></CustomButton>}
            </div>
          )
        })}
      </div>
      <div className={styles.newCommentContainer}>
        <textarea value={newComment} placeholder="Type Comment Here" onChange={updateComment}></textarea>
        <PageButton selected={false} onClick={() => {
          void saveComment().then(() => setReloadComments(!reloadComments))
        }} text='Submit Comment'></PageButton>
      </div>
    </div>
  );
};


export default Comments;
