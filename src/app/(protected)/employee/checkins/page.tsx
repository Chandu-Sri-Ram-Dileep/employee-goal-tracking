"use client";

import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

interface PendingCheckin {
  id: string;
  achievement: number;
  employeeComment: string;
  goalStatus: "NOT_STARTED" | "ON_TRACK" | "COMPLETED";
  submittedAt: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  uom: "NUMERIC" | "PERCENTAGE" | "TIMELINE" | "ZERO_BASED";
  achievement: string;
  comment: string;
  status: "NOT_STARTED" | "ON_TRACK" | "COMPLETED";
  progress: number;
  managerFeedback?: string;
  hasPending: boolean;
  pendingCheckin: PendingCheckin | null;
  goalSheetStatus: string;
}

export default function CheckinsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cycleName, setCycleName] = useState("");
  const [goalSheetStatus, setGoalSheetStatus] = useState("");

  const fetchGoalsAndCheckins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/checkins");
      if (!res.ok) {
        throw new Error("Failed to load goals for check-in");
      }
      const data = await res.json();
      setCycleName(data.cycleName || "");
      setGoalSheetStatus(data.goalSheetStatus || "DRAFT");
      setGoals(data.goals || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndCheckins();
  }, []);

  const calculateProgress = (achievement: number, target: number) => {
    if (Number.isNaN(achievement) || target <= 0) {
      return 0;
    }
    return Math.min(Math.round((achievement / target) * 100), 100);
  };

  const updateGoal = (index: number, field: keyof Goal, value: string) => {
    const updatedGoals = [...goals];
    updatedGoals[index] = {
      ...updatedGoals[index],
      [field]: value,
    } as Goal;

    if (field === "achievement") {
      updatedGoals[index].progress = calculateProgress(
        Number(value),
        updatedGoals[index].target
      );
    }

    setGoals(updatedGoals);
  };

  const handleSubmit = async (goal: Goal, index: number) => {
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalId: goal.id,
          achievement: Number(goal.achievement),
          comment: goal.comment,
          status: goal.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit check-in");
      }

      alert("Check-in submitted successfully!");
      
      // Refresh the page data to get the latest DB state
      await fetchGoalsAndCheckins();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to submit check-in");
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

  const isSheetApproved = goalSheetStatus === "APPROVED" || goalSheetStatus === "LOCKED";

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employee Check-ins {cycleName ? `(${cycleName})` : ""}
      </Typography>

      {isSheetApproved ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Submit progress updates for your approved goals. Once submitted, updates will go to your manager for review.
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your Goal Sheet is currently in <strong>{goalSheetStatus}</strong> status. You can only submit check-ins after your Goal Sheet has been APPROVED by your manager.
        </Alert>
      )}

      {goals.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            No goals found in the active cycle. Make sure you have created and submitted goals.
          </Typography>
        </Paper>
      ) : (
        goals.map((goal, index) => (
          <Paper key={goal.id} sx={{ p: 3, mb: 3, position: "relative" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Typography variant="h6">{goal.title}</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label={goal.status.replace("_", " ")}
                  color={
                    goal.status === "COMPLETED"
                      ? "success"
                      : goal.status === "ON_TRACK"
                      ? "warning"
                      : "default"
                  }
                  size="small"
                />
                {goal.hasPending && (
                  <Chip label="PENDING REVIEW" color="info" variant="outlined" size="small" />
                )}
              </Box>
            </Box>

            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {goal.description}
            </Typography>

            <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
              <Typography variant="body2">
                <strong>Target:</strong> {goal.target} {goal.uom}
              </Typography>
              <Typography variant="body2">
                <strong>Current Achievement:</strong> {goal.achievement} {goal.uom}
              </Typography>
            </Box>

            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Current Progress: {goal.progress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Number(goal.progress) || 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {goal.managerFeedback && (
              <Alert severity="info" sx={{ mb: 3, py: 0.5 }}>
                <strong>Manager Feedback:</strong> {goal.managerFeedback}
              </Alert>
            )}

            {goal.hasPending && goal.pendingCheckin && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <strong>Check-in pending approval:</strong> You have submitted a check-in with achievement{" "}
                <strong>{goal.pendingCheckin.achievement}</strong> and status{" "}
                <strong>{goal.pendingCheckin.goalStatus.replace("_", " ")}</strong>. 
                <br />
                <em>Comment: "{goal.pendingCheckin.employeeComment}"</em>
              </Alert>
            )}

            <Box sx={{ mt: 2, borderTop: "1px solid #eee", pt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "primary.main" }}>
                Submit Progress Check-in
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="New Achievement"
                  type="number"
                  fullWidth
                  disabled={!isSheetApproved || goal.hasPending}
                  value={goal.achievement}
                  onChange={(e) => updateGoal(index, "achievement", e.target.value)}
                  helperText={`Specify the total cumulative achievement towards the target of ${goal.target}`}
                />

                <TextField
                  select
                  fullWidth
                  label="New Status"
                  disabled={!isSheetApproved || goal.hasPending}
                  value={goal.status}
                  onChange={(e) => updateGoal(index, "status", e.target.value)}
                >
                  <MenuItem value="NOT_STARTED">Not Started</MenuItem>
                  <MenuItem value="ON_TRACK">On Track</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </TextField>

                <TextField
                  label="Progress Comment / Notes"
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!isSheetApproved || goal.hasPending}
                  value={goal.comment}
                  placeholder="Explain what was accomplished or reasons for changes..."
                  onChange={(e) => updateGoal(index, "comment", e.target.value)}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Button
                    variant="contained"
                    disabled={!isSheetApproved || goal.hasPending || !goal.achievement.toString().trim() || !goal.comment.trim()}
                    onClick={() => handleSubmit(goal, index)}
                  >
                    Submit Check-in
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
}