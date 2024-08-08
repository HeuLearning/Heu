import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { type AxiosRequestConfig } from "axios";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type AppError } from "models/app-error";
import { callExternalApi } from "../services/callExternalApi";
import { type SearchResult } from "models/search-result";

const apiServerUrl = process.env.API_SERVER_URL;

interface RequestBody {
  text_id: string,
  query: string,
}

const search = async (
  req: NextApiRequest,
  res: NextApiResponse<Array<SearchResult> | AppError>
) => {
  try {
    const { accessToken } = await getAccessToken(req, res);
    if (!accessToken) return res.status(500).json({message: "No Access Token"});

    // const body = req.body as RequestBody;
    const body = req.body as RequestBody;

    const config: AxiosRequestConfig = {
      url: `http://ec2-100-27-5-254.compute-1.amazonaws.com:8000/api/search`,
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: body
    };

    
    const { data, error, status } = await callExternalApi<Array<SearchResult>>({
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

export default withApiAuthRequired(search);