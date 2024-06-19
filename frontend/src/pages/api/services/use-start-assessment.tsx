// /* eslint-disable @typescript-eslint/no-unsafe-return */
// import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
// import { useEffect, useState } from "react";
// import useSWR from "swr";
// import { type AppError } from "models/app-error";
// import type { AssessmentHistory } from "models/assessment-history";
// // import type { Text } from "models/text";

// export const useStartAssessment = (config: AxiosRequestConfig | null) => {
//   const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory>();

//   const fetcher = async (config: AxiosRequestConfig) => {
//     try {
//       const response = await axios(config);
//       return response.data;
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         console.error("Axios error:", error.response?.data);
//         throw error;
//       } else {
//         console.error("Unexpected error:", error);
//         throw error;
//       }
//     }
//   };

//   const {
//     data,
//     error,
//     isLoading: isApiResponseLoading,
//   } = useSWR<AssessmentHistory, AxiosError<AppError>>(config, fetcher, {
//     revalidateIfStale: false,
//     revalidateOnFocus: false,
//     revalidateOnReconnect: false
//   });

//   useEffect(() => {
//     if (isApiResponseLoading) {
//       return;
//     }
//     if (error) {
//       console.error("Error loading assessment history:", error);
//       console.error("Error message:", error.message);
//       return;
//     }

//     if (data) {
//       console.log("Assessment history loaded:", data);
//       setAssessmentHistory(data);
//     }
//   }, [data, error, isApiResponseLoading]);

//   return { assessmentHistory };
// };


/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { type AppError } from "models/app-error";
import type { AssessmentHistory } from "models/assessment-history";

export const useStartAssessment = (config: AxiosRequestConfig | null) => {
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory>();

  const fetcher = async (config: AxiosRequestConfig) => {
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
        throw error;
      } else {
        console.error("Unexpected error:", error);
        throw error;
      }
    }
  };

  const {
    data,
    error,
    isLoading: isApiResponseLoading,
  } = useSWR<AssessmentHistory, AxiosError<AppError>>(config ? config : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    if (isApiResponseLoading) {
      return;
    }
    if (error) {
      console.error("Error loading assessment history:", error);
      console.error("Error message:", error.message);
      return;
    }

    if (data) {
      console.log("Assessment history loaded:", data);
      setAssessmentHistory(data);
    }
  }, [data, error, isApiResponseLoading]);

  return { assessmentHistory };
};
