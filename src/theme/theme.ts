import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#2563EB",
    },
    secondary: {
      main: "#16A34A",
    },
    error: {
      main: "#DC2626",
    },
    warning: {
      main: "#F59E0B",
    },
    background: {
      default: "#F8FAFC",
    },
  },

  typography: {
    fontFamily: "Inter, sans-serif",
  },

  shape: {
    borderRadius: 10,
  },
});