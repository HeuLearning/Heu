// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
// import { type AxiosRequestConfig } from "axios";
// import { type NextApiRequest, type NextApiResponse } from "next";
// import { type AppError } from "models/app-error";
// import { type Message } from "models/text";
// import { callExternalApi } from "../services/callExternalApi";

// const apiServerUrl = process.env.API_SERVER_URL;

// const getProtectedMessage = async (
//   req: NextApiRequest,
//   res: NextApiResponse<Message | AppError>
// ) => {
//   try {
//     const { accessToken } = await getAccessToken(req, res);
//     // console.log(accessToken)
//     if (!accessToken) return res.status(500).json({message: "No Access Token"});

//     const config: AxiosRequestConfig = {
//       url: `${apiServerUrl as string}/authors`,
//       method: "GET",
//       headers: {
//         "content-type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//     };

//     const { data, error, status } = await callExternalApi<Message>({
//       config,
//     });

//     if (data) {
//       res.status(status).json(data);
//       return;
//     }

//     res
//       .status(status || 500)
//       .json(error || { message: "Unable to retrieve message" });
//   } catch (error) {
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

// export default withApiAuthRequired(getProtectedMessage);