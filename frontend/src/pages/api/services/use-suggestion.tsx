// import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
// import { useEffect, useState } from "react";
// import useSWR from "swr";
// import { type AppError } from "models/app-error";
// import type { SuggestionTest } from "models/suggestion-test";

// export const getSuggestion = (config: AxiosRequestConfig) => {
//   // const [suggestion, setSuggestion] = useState<SuggestionTest>();

//   const fetcher = async (config: AxiosRequestConfig) =>
//     await axios(config).then((res) => res.data);

//   return { suggestion };
//   // 

//   // const {
//   //   data,
//   //   error,
//   //   isLoading: isApiResponseLoading,
//   // } = useSWR<SuggestionTest, AxiosError<AppError>>(config, fetcher);

//   // useEffect(() => {
//   //   if (isApiResponseLoading) {
//   //     return;
//   //   }

//   //   if (error) {
//   //     console.log(error)
//   //     // setText(
//   //     //   error.response && error.response.data
//   //     //     ? JSON.stringify(error.response.data, null, 2)
//   //     //     : "Something went wrong"
//   //     // );
//   //   }

//   //   if (data) {
//   //     setSuggestion(data);
//   //   }
//   // }, [data, error, isApiResponseLoading]);

// };
