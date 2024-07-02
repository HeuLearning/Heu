import { type AppType } from "next/dist/shared/lib/utils";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "~/styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "white",
          color: "rgba(0, 0, 0, 0.87)",
          "&:hover": {
            backgroundColor: "#f0f0f0",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "white",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "white",
        },
      },
    },
  },
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </ThemeProvider>
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
