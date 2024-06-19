/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { type AppError } from "models/app-error";
import type { AssessmentQuestion } from "models/assessment-question";
// import type { Text } from "models/text";

export const useAssessmentQuestion = (config: AxiosRequestConfig) => {
  const [assessmentQuestion, setAssessmentQuestion] = useState<AssessmentQuestion>();

  const fetcher = async (config: AxiosRequestConfig) =>
    await axios(config).then((res) => res.data);

  const {
    data,
    error,
    isLoading: isApiResponseLoading,
  } = useSWR<AssessmentQuestion, AxiosError<AppError>>(config, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  useEffect(() => {
    if (isApiResponseLoading) {
      return;
    }
    if (error) {
      console.log(error)
      console.log(error.message)
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
      setAssessmentQuestion(data);
    }
  }, [data, error, isApiResponseLoading, config]);

  return { assessmentQuestion };
};
