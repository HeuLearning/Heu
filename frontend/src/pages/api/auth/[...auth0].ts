
import  { handleAuth, handleCallback, handleLogin } from '@auth0/nextjs-auth0';
import { getAccessToken } from "@auth0/nextjs-auth0";
import type { AxiosRequestConfig } from "axios";
import axios from 'axios';
import type { NextApiResponse, NextApiRequest } from 'next';


const apiServerUrl = process.env.API_SERVER_URL;

export default handleAuth({
  onError (req, res, error){
    console.log(error)
    // errorLogger(error);
    res.writeHead(302, {
        Location: '/custom-error-page'
    });
    res.end();
  },

  login : async (req: NextApiRequest, res: NextApiResponse)=>{
    try {
      await handleLogin(req, res, {
        authorizationParams: { 
          prompt: 'login',
          audience: `${process.env.AUTH0_AUDIENCE}`, // or AUTH0_AUDIENCE
        
        },
        returnTo: '/',
      });

    } catch (error) {
      console.error(error);
    }
  },
  callback: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handleCallback(req, res)
      const { accessToken } = await getAccessToken(req, res);
      console.log(accessToken)
      const config: AxiosRequestConfig = {
        url: `${apiServerUrl}/check_user`,
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        }
      };
      await axios(config);
    } catch (error) {
      console.log(error)
      // res.status(error.status || 500).end(error.message)
    }
  },
});

// import NextAuth, { NextAuthOptions } from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
// import FacebookProvider from "next-auth/providers/facebook"
// import GithubProvider from "next-auth/providers/github"
// import TwitterProvider from "next-auth/providers/twitter"
// import Auth0Provider from "next-auth/providers/auth0"

// // For more information on each option (and a full list of options) go to
// // https://next-auth.js.org/configuration/options
// export const authOptions: NextAuthOptions = {
//   // https://next-auth.js.org/configuration/providers/oauth
//   providers: [
//     Auth0Provider({
//       clientId: process.env.AUTH0_ID,
//       clientSecret: process.env.AUTH0_SECRET,
//       issuer: process.env.AUTH0_ISSUER,
//     }),
//     FacebookProvider({
//       clientId: process.env.FACEBOOK_ID,
//       clientSecret: process.env.FACEBOOK_SECRET,
//     }),
//     GithubProvider({
//       clientId: process.env.GITHUB_ID,
//       clientSecret: process.env.GITHUB_SECRET,
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID,
//       clientSecret: process.env.GOOGLE_SECRET,
//     }),
//     TwitterProvider({
//       clientId: process.env.TWITTER_ID,
//       clientSecret: process.env.TWITTER_SECRET,
//       version: "2.0",
//     }),
//   ],
//   callbacks: {
//     async jwt({ token }) {
//       token.userRole = "admin"
//       return token
//     },
//   },
// }

// export default NextAuth(authOptions)
