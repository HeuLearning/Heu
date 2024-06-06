import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { type AxiosRequestConfig } from "axios";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type AppError } from "models/app-error";
import type { SuggestionTest } from "models/suggestion-test";
import { callExternalApi } from "../services/callExternalApi";
import { type WordIndex } from "models/word-index";

const apiServerUrl = process.env.API_SERVER_URL;

interface RequestBody {
  words: Array<WordIndex>
}

const getSuggestion = async (
  req: NextApiRequest,
  res: NextApiResponse<SuggestionTest | AppError>
) => {
  try {
    const { accessToken } = await getAccessToken(req, res);
    if (!accessToken) return res.status(500).json({message: "No Access Token"});

    // const body = req.body as RequestBody;
    const body = req.body as RequestBody;

    const config: AxiosRequestConfig = {
      url: `http://ec2-100-27-5-254.compute-1.amazonaws.com:8000/api/suggestions_get`,
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: body
    };

    
    const { data, error, status } = await callExternalApi<SuggestionTest>({
      config,
    });

    if (data) {
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

export default withApiAuthRequired(getSuggestion);