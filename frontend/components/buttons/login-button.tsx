import Link from "next/link";
import Button from "@mui/material/Button";
import theme from "../../src/theme.js";
import { ThemeProvider } from "@mui/material/styles";

export const LoginButton = () => {
  return (
    <Link className="button__login" href="/api/auth/login">
      <ThemeProvider theme={theme}>
        <Button variant="contained" color="primary">
          Log In
        </Button>
      </ThemeProvider>
    </Link>
  );
};
