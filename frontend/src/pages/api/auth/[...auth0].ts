
// import  { handleAuth, handleCallback, handleLogin } from '@auth0/nextjs-auth0';
// import { getAccessToken } from "@auth0/nextjs-auth0";
// import type { AxiosRequestConfig } from "axios";
// import axios from 'axios';
// import type { NextApiResponse, NextApiRequest } from 'next';


// const apiServerUrl = process.env.API_SERVER_URL;

// export default handleAuth({
//   onError (req, res, error){
//     console.log(error)
//     // errorLogger(error);
//     res.writeHead(302, {
//         Location: '/custom-error-page'
//     });
//     res.end();
//   },

//   login : async (req: NextApiRequest, res: NextApiResponse)=>{
//     try {
//       await handleLogin(req, res, {
//         authorizationParams: { 
//           prompt: 'login',
//           audience: `${process.env.AUTH0_AUDIENCE}`, // or AUTH0_AUDIENCE
        
//         },
//         returnTo: '/',
//       });

//     } catch (error) {
//       console.error(error);
//     }
//   },
//   callback: async (req: NextApiRequest, res: NextApiResponse) => {
//     try {
//       await handleCallback(req, res)
//       const { accessToken } = await getAccessToken(req, res);
//       console.log(accessToken)
//       const config: AxiosRequestConfig = {
//         url: `${apiServerUrl}/check_user`,
//         method: "POST", // changed
//         headers: {
//           "content-type": "application/json",
//           // Authorization: `Bearer ${accessToken}`,
//           // body: JSON.stringify({ token: accessToken }),
//         },
//         data: { token: accessToken }, // This is the correct way to send data in the body
//       };
//       await axios(config);
//     } catch (error) {
//       console.log(error)
//       // res.status(error.status || 500).end(error.message)
//     }
//   },
// });

// // import NextAuth, { NextAuthOptions } from "next-auth"
// // import GoogleProvider from "next-auth/providers/google"
// // import FacebookProvider from "next-auth/providers/facebook"
// // import GithubProvider from "next-auth/providers/github"
// // import TwitterProvider from "next-auth/providers/twitter"
// // import Auth0Provider from "next-auth/providers/auth0"

// // // For more information on each option (and a full list of options) go to
// // // https://next-auth.js.org/configuration/options
// // export const authOptions: NextAuthOptions = {
// //   // https://next-auth.js.org/configuration/providers/oauth
// //   providers: [
// //     Auth0Provider({
// //       clientId: process.env.AUTH0_ID,
// //       clientSecret: process.env.AUTH0_SECRET,
// //       issuer: process.env.AUTH0_ISSUER,
// //     }),
// //     FacebookProvider({
// //       clientId: process.env.FACEBOOK_ID,
// //       clientSecret: process.env.FACEBOOK_SECRET,
// //     }),
// //     GithubProvider({
// //       clientId: process.env.GITHUB_ID,
// //       clientSecret: process.env.GITHUB_SECRET,
// //     }),
// //     GoogleProvider({
// //       clientId: process.env.GOOGLE_ID,
// //       clientSecret: process.env.GOOGLE_SECRET,
// //     }),
// //     TwitterProvider({
// //       clientId: process.env.TWITTER_ID,
// //       clientSecret: process.env.TWITTER_SECRET,
// //       version: "2.0",
// //     }),
// //   ],
// //   callbacks: {
// //     async jwt({ token }) {
// //       token.userRole = "admin"
// //       return token
// //     },
// //   },
// // }

// // export default NextAuth(authOptions)


import { handleAuth, handleCallback, handleLogin } from '@auth0/nextjs-auth0';
import { getAccessToken } from "@auth0/nextjs-auth0";
import axios from 'axios';
import type { NextApiResponse, NextApiRequest } from 'next';

const apiServerUrl = process.env.API_SERVER_URL;

export default handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          audience: process.env.AUTH0_AUDIENCE,
          prompt: 'login',
        },
        returnTo: '/',
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(error.status || 500).end(error.message);
    }
  },

  async callback(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Handle the Auth0 callback
      await handleCallback(req, res);

      // After successful callback, get the access token
      const { accessToken } = await getAccessToken(req, res);

      // Use the access token to make a request to your Django backend
      try {
        await axios.post(
          `${apiServerUrl}/check_user`,
          { token: accessToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        // If the request is successful, redirect to the home page
        res.writeHead(302, { Location: '/' });
        res.end();
      } catch (djangoError) {
        console.error('Error communicating with Django backend:', djangoError);
        res.status(500).json({ error: 'Failed to communicate with backend' });
      }
    } catch (callbackError) {
      console.error('Callback error:', callbackError);
      res.status(callbackError.status || 500).end(callbackError.message);
    }
  },

  onError(req: NextApiRequest, res: NextApiResponse, error: Error) {
    console.error('Auth error:', error);
    res.status(error.status || 500).end(error.message);
  }
});