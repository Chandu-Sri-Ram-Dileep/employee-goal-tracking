"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import KeyIcon from "@mui/icons-material/Key";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const e = searchParams.get("email");
    const t = searchParams.get("token");
    if (e) setEmail(e);
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }

      setMessage(data.message);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <TextField
        label="Email Address"
        type="email"
        required
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2, "& .MuiInputBase-root": { color: "#fff" } }}
      />

      <TextField
        label="Reset Token"
        required
        fullWidth
        value={token}
        onChange={(e) => setToken(e.target.value)}
        sx={{ mb: 2, "& .MuiInputBase-root": { color: "#fff" } }}
      />

      <TextField
        label="New Password"
        type="password"
        required
        fullWidth
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        sx={{ mb: 2, "& .MuiInputBase-root": { color: "#fff" } }}
      />

      <TextField
        label="Confirm New Password"
        type="password"
        required
        fullWidth
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? "Updating Password..." : "Set New Password"}
      </Button>
    </Box>
  );
}

export default function ResetPasswordPage() {
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
                <KeyIcon fontSize="large" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Set New Password
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.5)", mt: 0.5 }}>
                Enter your reset token and new account credentials.
              </Typography>
            </Box>

            <Suspense fallback={<Typography>Loading reset form...</Typography>}>
              <ResetPasswordForm />
            </Suspense>

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
