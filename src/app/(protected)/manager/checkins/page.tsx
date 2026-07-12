"use client";

import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

interface Checkin {
  id: string;
  employeeName: string;
  department: string;
  goalTitle: string;
  goalDescription: string;
  uom: string;
  target: number;
  achievement: number;
  progress: number;
  employeeComment: string;
  managerFeedback?: string;
  submittedDate: string;
  status: "PENDING" | "APPROVED" | "RETURNED";
  goalStatus?: "NOT_STARTED" | "ON_TRACK" | "COMPLETED";
}

export default function ManagerCheckinsPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [managerFeedback, setManagerFeedback] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCheckins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/checkins");
      if (!res.ok) {
        throw new Error("Failed to load team check-ins");
      }
      const data = await res.json();
      setCheckins(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load check-ins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckins();
  }, []);

  const handleReview = (checkin: Checkin) => {
    setSelectedCheckin(checkin);
    setManagerFeedback(checkin.managerFeedback || "");
    setOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedCheckin) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/checkins/${selectedCheckin.id}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          managerFeedback,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to approve check-in");
      }

      alert("Check-in approved successfully!");
      setOpen(false);
      await fetchCheckins();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to approve check-in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedCheckin) return;

    if (!managerFeedback.trim()) {
      alert("Feedback comment is required when returning a check-in for rework.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/checkins/${selectedCheckin.id}/return`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          managerFeedback,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to return check-in");
      }

      alert("Check-in returned to employee successfully.");
      setOpen(false);
      await fetchCheckins();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to return check-in");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manager Check-in Reviews
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Review employee goal progress updates, verify achievements, and approve or return them for rework.
      </Alert>

      {checkins.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            No check-ins submitted by your team members yet.
          </Typography>
        </Paper>
      ) : (
        checkins.map((checkin) => (
          <Paper key={checkin.id} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h6">{checkin.employeeName}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Department: {checkin.department} | Submitted: {checkin.submittedDate}
                </Typography>
                <Typography variant="body1">
                  <strong>Goal:</strong> {checkin.goalTitle}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Proposed Achievement:</strong> {checkin.achievement} / {checkin.target} {checkin.uom} ({checkin.progress}%)
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Chip
                  label={checkin.status}
                  color={
                    checkin.status === "APPROVED"
                      ? "success"
                      : checkin.status === "RETURNED"
                      ? "error"
                      : "warning"
                  }
                />
                <Button variant="contained" onClick={() => handleReview(checkin)}>
                  {checkin.status === "PENDING" ? "Review" : "View"}
                </Button>
              </Box>
            </Box>
          </Paper>
        ))
      )}

      <Dialog open={open} onClose={() => !submitting && setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Check-in Review</DialogTitle>

        <DialogContent>
          {selectedCheckin && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Box sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
                <Typography variant="subtitle1">
                  <strong>Employee:</strong> {selectedCheckin.employeeName} ({selectedCheckin.department})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Submitted Date: {selectedCheckin.submittedDate}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="primary">
                  Goal Details
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {selectedCheckin.goalTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCheckin.goalDescription}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 4, bgcolor: "#f5f5f5", p: 1.5, borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Target:</strong> {selectedCheckin.target} {selectedCheckin.uom}
                </Typography>
                <Typography variant="body2">
                  <strong>Proposed Achievement:</strong> {selectedCheckin.achievement} {selectedCheckin.uom}
                </Typography>
                {selectedCheckin.goalStatus && (
                  <Typography variant="body2">
                    <strong>Proposed Status:</strong> {selectedCheckin.goalStatus.replace("_", " ")}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Calculated Progress: {selectedCheckin.progress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={selectedCheckin.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mt: 1, bgcolor: "#eef7ff", p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>
                  Employee Comment
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  "{selectedCheckin.employeeComment}"
                </Typography>
              </Box>

              <TextField
                label="Manager Feedback / Remarks"
                fullWidth
                multiline
                rows={4}
                disabled={selectedCheckin.status !== "PENDING" || submitting}
                value={managerFeedback}
                onChange={(e) => setManagerFeedback(e.target.value)}
                placeholder={
                  selectedCheckin.status === "PENDING"
                    ? "Add feedback comments here. Required when returning for rework."
                    : "No feedback was provided."
                }
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {submitting ? (
            <CircularProgress size={24} sx={{ mx: 2 }} />
          ) : selectedCheckin?.status === "PENDING" ? (
            <>
              <Button color="error" onClick={handleReturn}>
                Return For Rework
              </Button>
              <Button variant="contained" color="success" onClick={handleApprove}>
                Approve
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpen(false)}>Close</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}