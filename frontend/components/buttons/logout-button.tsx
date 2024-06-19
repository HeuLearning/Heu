import Link from "next/link";
import Button from "@mui/material/Button";
import theme from "../../src/theme.js";
import { ThemeProvider } from "@mui/material/styles";

export const LogoutButton = () => {
  return (
    // <Link className="button__logout" href="/api/auth/logout">
    //   Log Out
    // </Link>

    <Link className="button__login" href="/api/auth/logout">
    <ThemeProvider theme={theme}>
      <Button variant="contained" color="primary">
        Logout
      </Button>
    </ThemeProvider>
    </Link>
  );
};