
import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { type AxiosRequestConfig } from "axios";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type AppError } from "models/app-error";
import type { AssessmentQuestion } from "models/assessment-question";
import { callExternalApi } from "../services/callExternalApi";

const apiServerUrl = process.env.API_SERVER_URL;

const getUserRole = async (
  req: NextApiRequest,
  res: NextApiResponse<AssessmentQuestion | AppError>
) => {
  console.log("as;ldfkjas;ldkfjasdf");
  try {
    const { accessToken } = await getAccessToken(req, res);
    console.log(accessToken)
    if (!accessToken) return res.status(500).json({message: "No Access Token"});
    // const body = await req.json();
    // const assessmentData = req.body.assessmentData as AssessmentHistory;

    const config: AxiosRequestConfig = {
      url: `http://localhost:8000/api/get-user-role`,
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const { data, error, status } = await callExternalApi<AssessmentQuestion>({
      config,
    });

    if (data) {
      // console.log(data)
      res.status(status).json(data);
      return;
    }

    res
      .status(status || 500)
      .json(error || { message: "Unable to retrieve message" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default withApiAuthRequired(getUserRole);