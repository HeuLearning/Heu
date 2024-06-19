
import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { type AxiosRequestConfig } from "axios";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type AppError } from "models/app-error";
import type { AssessmentHistory } from "models/assessment-history";
import { callExternalApi } from "../services/callExternalApi";

const apiServerUrl = process.env.API_SERVER_URL;

const startAssessment = async (
  req: NextApiRequest,
  res: NextApiResponse<AssessmentHistory | AppError>
) => {
  try {
    const { accessToken } = await getAccessToken(req, res);
    console.log("are we here or what")
    if (!accessToken) return res.status(500).json({message: "No Access Token"});

    const config: AxiosRequestConfig = {
      url: `http://localhost:8000/api/start-assessment`,
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const { data, error, status } = await callExternalApi<AssessmentHistory>({
      config,
    });

    if (data) {
      // console.log(data)
      res.status(status).json(data);
      return;
    }
    
    if (error){
      console.log(error);
    }

    res
      .status(status || 500)
      .json(error || { message: "Unable to retrieve message" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default(startAssessment);
// export default withApiAuthRequired(startAssessment);

