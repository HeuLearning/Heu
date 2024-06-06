/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { type AppError } from "models/app-error";
import type TextWithSuggestions from "models/text-with-suggestions";

export const useText = (config: AxiosRequestConfig) => {
  const [text, setText] = useState<TextWithSuggestions>();

  const fetcher = async (config: AxiosRequestConfig) =>
    await axios(config).then((res) => res.data);

  const {
    data,
    error,
    isLoading: isApiResponseLoading,
  } = useSWR<TextWithSuggestions, AxiosError<AppError>>(config, fetcher);

  useEffect(() => {
    if (isApiResponseLoading) {
      return;
    }

    if (error) {
      console.log(error)
      // setText(
      //   error.response && error.response.data
      //     ? JSON.stringify(error.response.data, null, 2)
      //     : "Something went wrong"
      // );
    }

    if (data) {
      setText(data);
    }
  }, [data, error, isApiResponseLoading]);
  return { text };
};
