"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
// import { useAuthStore } from "@/store/authStore";
export default function LoginPage() {
  const router = useRouter();
  // const setAuth = useAuthStore(
  //   (state) => state.setAuth
  // );
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  // const handleLogin = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");

  //     const response =
  //       await fetch(
  //         "/api/auth/login",
  //         {
  //           method: "POST",

  //           headers: {
  //             "Content-Type":
  //               "application/json",
  //           },

  //           body: JSON.stringify({
  //             email,
  //             password,
  //           }),
  //         }
  //       );

  //     const data =
  //       await response.json();

  //     if (!response.ok) {
  //       throw new Error(
  //         data.message ||
  //           "Login failed"
  //       );
  //     }

  //     setAuth(
  //       {
  //         id:data.user.id,

  //         name:data.user.name,

  //         email:
  //           data.user.email,

  //         role: data.user.role,
  //       },
  //       data.token
  //     );

  //     if (
  //       data.user.role ===
  //       "ADMIN"
  //     ) {
  //       router.push(
  //         "/admin/dashboard"
  //       );
  //     } else if (
  //       data.user.role ===
  //       "MANAGER"
  //     ) {
  //       router.push(
  //         "/manager/dashboard"
  //       );
  //     } else {
  //       router.push(
  //         "/employee/dashboard"
  //       );
  //     }
  //   } catch (err: any) {
  //     setError(
  //       err.message ||
  //         "Login failed"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleLogin = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      "/api/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ??
          "Login Failed"
      );
    }

    if (
      data.user.role ===
      "ADMIN"
    ) {
      router.push(
        "/admin/dashboard"
      );
    } else if (
      data.user.role ===
      "MANAGER"
    ) {
      router.push(
        "/manager/dashboard"
      );
    } else {
      router.push(
        "/employee/dashboard"
      );
    }

    router.refresh();
  } catch (err: any) {
    setError(
      err.message ??
        "Login Failed"
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <Box
      sx={{
        height: "100vh",

        display: "flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        bgcolor:
          "background.default",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,

          width: 420,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
        >
          Employee Goal Tracking
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Sign in to continue
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
        />

        <TextField
          fullWidth
          type="password"
          label="Password"
          margin="normal"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress
              size={24}
            />
          ) : (
            "Login"
          )}
        </Button>
      </Paper>
    </Box>
  );
}