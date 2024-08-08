import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { type AxiosRequestConfig } from "axios";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type AppError } from "models/app-error";
import type TextWithSuggestions from "models/text-with-suggestions";
import { callExternalApi } from "../services/callExternalApi";

const apiServerUrl = process.env.API_SERVER_URL;

interface RequestBody {
  id: number;
  chunk: number;
}

const getText = async (
  req: NextApiRequest,
  res: NextApiResponse<TextWithSuggestions | AppError>
) => {
  try {
    const { accessToken } = await getAccessToken(req, res);
    // console.log(accessToken)
    if (!accessToken) return res.status(500).json({message: "No Access Token"});

    const body = req.body as RequestBody;

    const id: number = body.id;
    const chunk: number = body.chunk;
    const config: AxiosRequestConfig = {
      url: `http://ec2-100-27-5-254.compute-1.amazonaws.com:8000/api/text/${id}/${chunk}`,
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const { data, error, status } = await callExternalApi<TextWithSuggestions>({
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

export default withApiAuthRequired(getText);