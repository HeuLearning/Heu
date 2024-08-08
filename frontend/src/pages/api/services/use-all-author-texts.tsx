/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { type AppError } from "models/app-error";
import type { Text } from "models/text";

export const useAllAuthorTexts = (config: AxiosRequestConfig) => {
  const [texts, setText] = useState<Array<Text>>();

  const fetcher = async (config: AxiosRequestConfig) =>
    await axios(config).then((res) => res.data);

  const {
    data,
    error,
    isLoading: isApiResponseLoading,
  } = useSWR<Array<Text>, AxiosError<AppError>>(config, fetcher);

  useEffect(() => {
    if (isApiResponseLoading) {
      return;
    }
    if (error) {
      console.log(error)
    }
    // if (error) {
    //   setText(
    //     error.response && error.response.data
    //       ? JSON.stringify(error.response.data, null, 2)
    //       : "Something went wrong"
    //   );
    // }

    if (data) {
      console.log(data)
      setText(data);
    }
  }, [data, error, isApiResponseLoading]);

  return { texts };
};
