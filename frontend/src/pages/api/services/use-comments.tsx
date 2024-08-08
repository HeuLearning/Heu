/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { type AppError } from "models/app-error";
import type { CommentModel } from "models/comment";

export const useComment = (config: AxiosRequestConfig, change: boolean) => {
  const [comments, setComments] = useState<Array<CommentModel>>();

  const fetcher = async (config: AxiosRequestConfig) =>
    await axios(config).then((res) => res.data);

  const {
    data,
    mutate,
    error,
    isLoading: isApiResponseLoading,
  } = useSWR<Array<CommentModel>, AxiosError<AppError>>(config, fetcher);

  useEffect(() => {
    if (isApiResponseLoading) {
      return;
    }

    if (error) {
      // console.log(`"useComment" ${error}`)
      // setText(
      //   error.response && error.response.data
      //     ? JSON.stringify(error.response.data, null, 2)
      //     : "Something went wrong"
      // );
    }

    if (data) {
      setComments(data);
    }
  }, [data, error, isApiResponseLoading, change]);
  return { comments, mutate };
};
