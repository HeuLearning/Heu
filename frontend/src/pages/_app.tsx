import { type AppType } from "next/dist/shared/lib/utils";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
};

export default MyApp;

// import { SessionProvider } from "next-auth/react"
// // import "./styles.css"
// import "~/styles/globals.css";

// import type { AppProps } from "next/app"
// import type { Session } from "next-auth"

// // Use of the <SessionProvider> is mandatory to allow components that call
// // `useSession()` anywhere in your application to access the `session` object.
// export default function App({
//   Component,
//   pageProps: { session, ...pageProps },
// }: AppProps<{ session: Session }>) {
//   return (
//     <SessionProvider session={session}>
//       <Component {...pageProps} />
//     </SessionProvider>
//   )
// }
