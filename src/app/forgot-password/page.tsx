"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    setResetToken(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to process request");
        return;
      }

      setMessage(data.message);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0b0f19",
        color: "#fff",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            bgcolor: "#111827",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            borderRadius: 3,
            color: "#fff",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1.5,
                  borderRadius: "50%",
                  bgcolor: "rgba(99, 102, 241, 0.15)",
                  color: "#6366f1",
                  mb: 1.5,
                }}
              >
                <LockResetIcon fontSize="large" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Reset Password
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.5)", mt: 0.5 }}>
                Enter your account email to receive a password reset token.
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

            {resetToken && (
              <Alert severity="info" sx={{ mb: 2, wordBreak: "break-all" }}>
                <strong>Dev Reset Token:</strong> {resetToken}
                <Box sx={{ mt: 1 }}>
                  <Link
                    href={`/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`}
                    style={{ color: "#6366f1", fontWeight: 700 }}
                  >
                    Click here to Reset Password Now →
                  </Link>
                </Box>
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3, "& .MuiInputBase-root": { color: "#fff" } }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.2,
                  bgcolor: "#6366f1",
                  "&:hover": { bgcolor: "#4f46e5" },
                  fontWeight: 700,
                }}
              >
                {loading ? "Generating Token..." : "Send Reset Token"}
              </Button>
            </Box>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Link href="/login" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem" }}>
                ← Back to Login
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
