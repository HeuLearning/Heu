import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { type AxiosRequestConfig } from "axios";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type AppError } from "models/app-error";
import type { Text } from "models/text";
import { callExternalApi } from "../services/callExternalApi";

const apiServerUrl = process.env.API_SERVER_URL;

const demo = async (
  req: NextApiRequest,
  res: NextApiResponse<Array<Text> | AppError>
) => {
  try {
    const { accessToken } = await getAccessToken(req, res);
    // console.log(accessToken)
    if (!accessToken) return res.status(500).json({message: "No Access Token"});


    const config: AxiosRequestConfig = {
      url: `localhost:8000/api/demo/`,
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const { data, error, status } = await callExternalApi<Array<Text>>({
      config,
    });

    if (data) {
      res.status(status).json(data);
      return;
    }

    res
      .status(status || 500)
      .json(error );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default withApiAuthRequired(demo);