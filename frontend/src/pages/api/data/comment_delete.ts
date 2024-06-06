import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { type AxiosRequestConfig } from "axios";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type AppError } from "models/app-error";
import { callExternalApi } from "../services/callExternalApi";
import type { CommentModel } from "models/comment";

const apiServerUrl = process.env.API_SERVER_URL;

interface RequestBody {
  suggestion_id: number
}

const deleteComment = async (
  req: NextApiRequest,
  res: NextApiResponse<CommentModel | AppError>
) => {
  try {
    const { accessToken } = await getAccessToken(req, res);
    if (!accessToken) return res.status(500).json({message: "No Access Token"});

    // const body = req.body as RequestBody;
    const body = req.body as RequestBody;

    const config: AxiosRequestConfig = {
      url: `http://ec2-100-27-5-254.compute-1.amazonaws.com:8000/api/comment_delete`,
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: body
    };

    
    const { data, error, status } = await callExternalApi<CommentModel>({
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

export default withApiAuthRequired(deleteComment);