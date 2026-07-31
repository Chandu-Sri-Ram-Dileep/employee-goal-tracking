"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  IconButton,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

export default function LoginPage() {
  const router = useRouter();

  // ── Login state ────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Forgot-password dialog state ───────────────────────────────────────────
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMessage, setFpMessage] = useState("");
  const [fpError, setFpError] = useState("");
  // In dev mode the API returns the temp password so you can test immediately
  const [devTempPw, setDevTempPw] = useState("");

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Login failed");
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (data.user.role === "MANAGER") {
        router.push("/manager/dashboard");
      } else {
        router.push("/employee/dashboard");
      }

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!fpEmail.trim()) {
      setFpError("Please enter your email address.");
      return;
    }
    try {
      setFpLoading(true);
      setFpError("");
      setFpMessage("");
      setDevTempPw("");

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFpError(data.message ?? "Request failed.");
        return;
      }

      setFpMessage(data.message);

      // Dev convenience: show the temporary password in the dialog
      if (data._devTempPassword) {
        setDevTempPw(data._devTempPassword);
      }
    } catch {
      setFpError("An unexpected error occurred. Please try again.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleForgotClose = () => {
    setForgotOpen(false);
    setFpEmail("");
    setFpMessage("");
    setFpError("");
    setDevTempPw("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        p: 2,
      }}
    >
      {/* Decorative blobs */}
      <Box
        sx={{
          position: "fixed",
          top: "15%",
          left: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: "15%",
          right: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 440,
          borderRadius: 3,
          bgcolor: "rgba(30, 41, 59, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrackChangesIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#f8fafc", lineHeight: 1 }}>
              GoalTrack
            </Typography>
            <Typography variant="caption" sx={{ color: "#6366f1", fontWeight: 600 }}>
              Performance Management
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: "#f8fafc", mb: 0.5 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
          Sign in to your account to continue
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: "#64748b", fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(15,23,42,0.6)",
              borderRadius: 2,
              "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover fieldset": { borderColor: "rgba(99,102,241,0.5)" },
              "&.Mui-focused fieldset": { borderColor: "#6366f1" },
            },
            "& .MuiInputLabel-root": { color: "#64748b" },
            "& .MuiInputBase-input": { color: "#f1f5f9" },
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "#64748b", fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ color: "#64748b" }}
                  >
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(15,23,42,0.6)",
              borderRadius: 2,
              "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover fieldset": { borderColor: "rgba(99,102,241,0.5)" },
              "&.Mui-focused fieldset": { borderColor: "#6366f1" },
            },
            "& .MuiInputLabel-root": { color: "#64748b" },
            "& .MuiInputBase-input": { color: "#f1f5f9" },
          }}
        />

        {/* Forgot password link */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5, mb: 2 }}>
          <Link
            component="button"
            underline="hover"
            onClick={() => setForgotOpen(true)}
            sx={{ color: "#6366f1", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer" }}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            py: 1.4,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            "&:hover": { background: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
            "&:disabled": { opacity: 0.6 },
            boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
        </Button>

        <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.06)" }} />
        <Typography variant="caption" sx={{ color: "#475569", textAlign: "center", display: "block" }}>
          Secured with JWT authentication · 2026 GoalTrack PMS
        </Typography>
      </Paper>

      {/* ── Forgot Password Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={forgotOpen}
        onClose={handleForgotClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper:{
          sx: {
            bgcolor: "#1e293b",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3,
          },
        },
      }
      }
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
            Enter your registered email address. We will send you a{" "}
            <strong>temporary password</strong> that expires in{" "}
            <strong>24 hours</strong>. Log in with it and change your password
            immediately in Settings.
          </Typography>

          {fpError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {fpError}
            </Alert>
          )}

          {fpMessage && !devTempPw && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {fpMessage}
            </Alert>
          )}

          {/* Dev-only temp password display */}
          {devTempPw && (
            <Alert
              severity="info"
              sx={{ mb: 2, borderRadius: 2, fontFamily: "monospace" }}
            >
              <strong>[DEV MODE]</strong> Temporary password:{" "}
              <strong style={{ letterSpacing: 2 }}>{devTempPw}</strong>
              <br />
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                In production this will be emailed instead. Expires in 24 hours.
              </span>
            </Alert>
          )}

          {!fpMessage && (
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(15,23,42,0.5)",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                  "&:hover fieldset": { borderColor: "rgba(99,102,241,0.5)" },
                  "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                },
                "& .MuiInputLabel-root": { color: "#64748b" },
                "& .MuiInputBase-input": { color: "#f1f5f9" },
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleForgotClose}
            sx={{ color: "#94a3b8", textTransform: "none" }}
          >
            {fpMessage ? "Close" : "Cancel"}
          </Button>
          {!fpMessage && (
            <Button
              variant="contained"
              onClick={handleForgotPassword}
              disabled={fpLoading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              {fpLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Send Temporary Password"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}