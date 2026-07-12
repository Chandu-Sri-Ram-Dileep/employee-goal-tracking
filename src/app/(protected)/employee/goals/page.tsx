"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type GoalSheetStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "RETURNED"
  | "LOCKED";

type GoalType =
  | "PERSONAL"
  | "SHARED";

interface Goal {
  id: string;

  goalType: GoalType;

  title: string;

  description: string;

  thrustArea: string;

  uom:
    | "NUMERIC"
    | "PERCENTAGE"
    | "TIMELINE"
    | "ZERO_BASED";

  target: string;

  weightage: number;

  achievement?: number;

  progress?: number;

  status?:
    | "NOT_STARTED"
    | "ON_TRACK"
    | "COMPLETED";

  managerFeedback?: string;

  isLocked: boolean;
}

const THRUST_AREAS = [
  "Sales",
  "Operations",
  "Engineering",
  "HR",
  "Finance",
];

const UOM_TYPES = [
  "NUMERIC",
  "PERCENTAGE",
  "TIMELINE",
  "ZERO_BASED",
];

export default function GoalsPage() {
  const [goals, setGoals] =
    useState<Goal[]>([]);

  const [sheetStatus, setSheetStatus] =
    useState<GoalSheetStatus>("DRAFT");

  const [cycleName, setCycleName] =
    useState("FY 2026");

  const [loading, setLoading] =
    useState(false);
  const [unlockDialog, setUnlockDialog] =
    useState(false);

  const [unlockReason, setUnlockReason] =
    useState("");

  const [goalSheetId, setGoalSheetId] =
    useState("");

  const totalWeightage =
    goals.reduce(
      (
        total,
        goal
      ) =>
        total +
        Number(
          goal.weightage
        ),
      0
    );

  const personalGoals =
    goals.filter(
      (goal) =>
        goal.goalType ===
        "PERSONAL"
    );
  const sharedGoals =
    goals.filter(
      (goal) =>
        goal.goalType ===
        "SHARED"
    );

  const canEdit =
    sheetStatus === "DRAFT" ||
    sheetStatus === "RETURNED";

  const canRequestUnlock =
    sheetStatus === "APPROVED" ||
    sheetStatus === "LOCKED";

  useEffect(() => {
    loadGoalSheet();
  }, []);

  const loadGoalSheet =
    async () => {
      try {
        setLoading(true);

        /*
        GET

        /api/employee/goals

        */

        const response =
          await fetch(
            "/api/employee/goals"
          );

        if (!response.ok)
          return;

        const data =
          await response.json();

        setGoals(
          data.goals || []
        );

        setSheetStatus(
          data.status ||
            "DRAFT"
        );

        setCycleName(
          data.cycleName ||
            "FY 2026"
        );

        setGoalSheetId(
          data.goalSheetId || ""
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  // const updateGoal = (
  //   index: number,
  //   field: keyof Goal,
  //   value: any
  // ) => {
  //   const updated = [...goals];

  //   updated[index] = {
  //     ...updated[index],
  //     [field]: value,
  //   };

  //   setGoals(updated);
  // };
  const updateGoal = (
  goalId: string,
  field: keyof Goal,
  value: string | number
) => {
  setGoals((prev) =>
    prev.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            [field]: value,
          }
        : goal
    )
  );
};

  const addGoal = () => {
    if (
      personalGoals.length >=
      8
    ) {
      alert(
        "Maximum 8 personal goals allowed"
      );
      return;
    }

    setGoals([
      ...goals,

      {
        id:
          "NEW-" +
          Date.now(),

        goalType:
          "PERSONAL",

        title: "",

        description: "",

        thrustArea: "",

        uom: "NUMERIC",

        target: "",

        weightage: 0,

        achievement: 0,

        progress: 0,

        status:
          "NOT_STARTED",

        managerFeedback:
          "",

        isLocked: false,
      },
    ]);
  };

  // const deleteGoal = (
  //   index:number
  // ) => {
  //   const goal =
  //     goals[index];

  //   if (
  //     goal.goalType ===
  //     "SHARED"
  //   ) {
  //     alert(
  //       "Shared goals cannot be deleted"
  //     );
  //     return;
  //   }

  //   setGoals(
  //     goals.filter(
  //       (_, i) =>
  //         i !== index
  //     )
  //   );
  // };
  const deleteGoal = (
  goalId: string
) => {
  const goal = goals.find(
    (g) => g.id === goalId
  );

  if (!goal) return;

  if (goal.goalType === "SHARED") {
    alert(
      "Shared goals cannot be deleted"
    );
    return;
  }

  setGoals((prevGoals) =>
    prevGoals.filter(
      (g) => g.id !== goalId
    )
  );
};
  // const saveDraft =
  //   async () => {
  //     try {
  //       const response =
  //         await fetch(
  //           "/api/employee/goals/save",
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type":
  //                 "application/json",
  //             },
  //             body: JSON.stringify({
  //               goals,
  //             }),
  //           }
  //         );

  //       if (!response.ok) {
  //         alert(
  //           "Failed to save draft"
  //         );
  //         return;
  //       }

  //       alert(
  //         "Draft saved successfully"
  //       );
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
const saveDraft = async () => {
  try {
    const response = await fetch(
      "/api/employee/goals/save",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goals,
        }),
      }
    );

    const data = await response.json();

    console.log(response.status);
    console.log(data);

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Draft saved");
  } catch (error) {
    console.error(error);
  }
};
  // const submitGoalSheet =
  //   async () => {
  //     if (
  //       totalWeightage !==
  //       100
  //     ) {
  //       alert(
  //         "Total weightage must equal 100%"
  //       );
  //       return;
  //     }

  //     try {
  //       const response =
  //         await fetch(
  //           "/api/employee/goals/submit",
  //           {
  //             method: "PUT",
  //           }
  //         );

  //       if (!response.ok) {
  //         alert(
  //           "Failed to submit goals"
  //         );
  //         return;
  //       }

  //       setSheetStatus(
  //         "SUBMITTED"
  //       );

  //       alert(
  //         "Goal Sheet submitted successfully"
  //       );
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  const submitGoalSheet = async () => {
  if (totalWeightage !== 100) {
    alert("Total weightage must equal 100%");
    return;
  }

  try {
    const response = await fetch(
      "/api/employee/goals/submit",
      {
        method: "PUT", 
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      console.log(data);
      return;
    }

    setSheetStatus("SUBMITTED");

    alert("Goal Sheet submitted successfully");
  } catch (error) {
    console.error(error);
  }
};
  const requestUnlock =
    async () => {
      if (!goalSheetId) {
        alert("Goal Sheet not found. Please refresh the page and try again.");
        return;
      }
      if (!unlockReason.trim()) {
        alert("Please enter a reason for the unlock request.");
        return;
      }
      try {
        const response =
          await fetch(
            "/api/employee/unlock-request/create",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                goalSheetId,
                reason: unlockReason,
              }),
            }
          );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to submit unlock request");
          return;
        }

        setUnlockDialog(
          false
        );

        setUnlockReason(
          ""
        );

        alert(
          "Unlock request submitted successfully"
        );
      } catch (error) {
        console.error(error);
        alert("An unexpected error occurred. Please try again.");
      }
    };

  return (
    <Box>
      <Typography
  variant="h4"
  gutterBottom
  sx={{ fontWeight: 'bold' }}
>
        Goal Management
      </Typography>

     <Typography
  color="text.secondary"
  sx={{ mb: 4 }}
>
        Create, manage and
        track your goals
        for {cycleName}
      </Typography>

      <Grid
  container
  spacing={3}
  sx={{ mb: 4 }}
>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: "center" }}
>
                <AssignmentIcon
                  color="primary"
                />

                <Box>
                <Typography
  variant="h5"
  sx={{ fontWeight: "bold" }}
>
                    {
                      goals.length
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Total Goals
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
               <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: "center" }}
>
                <TrackChangesIcon
                  color="success"
                />

                <Box>
                  <Typography
  variant="h5"
  sx={{ fontWeight: "bold" }}
>
                    {
                      totalWeightage
                    }
                    %
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Weightage
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: "center" }}
>
                <CheckCircleIcon
                  color="success"
                />

                <Box>
                 <Typography
  variant="h5"
  sx={{ fontWeight: "bold" }}
>
                    {
                      personalGoals.length
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Personal Goals
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: "center" }}
>
                <LockIcon
                  color="warning"
                />

                <Box>
                  <Typography
  variant="h6"
  sx={{ fontWeight: "bold" }}
>
                    {
                      sheetStatus
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Sheet Status
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        sx={{
          p: 3,
          mb: 4,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Goal Sheet Workflow
        </Typography>

        <LinearProgress
          variant="determinate"
          value={
            sheetStatus ===
            "DRAFT"
              ? 20
              : sheetStatus ===
                "SUBMITTED"
              ? 50
              : sheetStatus ===
                "RETURNED"
              ? 35
              : 100
          }
          sx={{
            height: 10,
            borderRadius: 5,
            mb: 2,
          }}
        />

        <Chip
          label={
            sheetStatus
          }
          color={
            sheetStatus ===
            "APPROVED"
              ? "success"
              : sheetStatus ===
                "RETURNED"
              ? "error"
              : "primary"
          }
        />

        {sheetStatus ===
          "SUBMITTED" && (
          <Alert
            severity="info"
            sx={{ mt: 2 }}
          >
            Waiting for
            manager approval.
          </Alert>
        )}

        {sheetStatus ===
          "RETURNED" && (
          <Alert
            severity="warning"
            sx={{ mt: 2 }}
          >
            Goal sheet
            returned by
            manager. Please
            modify and
            resubmit.
          </Alert>
        )}

        {sheetStatus ===
          "APPROVED" && (
          <Alert
            severity="success"
            sx={{ mt: 2 }}
          >
            Goal sheet
            approved and
            locked.
          </Alert>
        )}
      </Paper>

     <Stack 
  direction="row" 
  spacing={2} 
  sx={{ mb: 4 }}
>
        {canEdit && (
          <>
            <Button
              variant="contained"
              onClick={
                addGoal
              }
            >
              Add Goal
            </Button>

            <Button
              variant="outlined"
              onClick={
                saveDraft
              }
            >
              Save Draft
            </Button>

            <Button
              color="success"
              variant="contained"
              onClick={
                submitGoalSheet
              }
            >
              Submit To
              Manager
            </Button>
          </>
        )}

        {canRequestUnlock && (
          <Button
            startIcon={
              <LockOpenIcon />
            }
            color="warning"
            variant="contained"
            onClick={() =>
              setUnlockDialog(
                true
              )
            }
          >
            Request Unlock
          </Button>
        )}
      </Stack>
            <Grid
        container
        spacing={3}
      >
        {goals.map(
          (
            goal,
            index
          ) => (
            <Grid
              key={goal.id}
              size={{
                xs: 12,
              }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                }}
              >
                <CardContent>
                 <Stack
  direction="row"
  spacing={2} // Keeps layout spacing if needed, or remove if not using it
  sx={{ 
    justifyContent: "space-between", 
    alignItems: "center", 
    mb: 2 
  }}
>
  <Typography
    variant="h6"
    sx={{ fontWeight: "bold" }}
  >
                      Goal #
                      {index + 1}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                    >
                      <Chip
                        label={
                          goal.status
                        }
                        color={
                          goal.status ===
                          "COMPLETED"
                            ? "success"
                            : "primary"
                        }
                      />

                      {canEdit && (
                        <IconButton
                          color="error"
                          onClick={() =>
                            deleteGoal(
                              goal.id
                            )
                          }
                        >
                          {/* <DeleteIcon /> */}
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>

                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <TextField
                        label="Goal Title"
                        fullWidth
                        disabled={
                          !canEdit
                        }
                        value={
                          goal.title
                        }
                        onChange={(
                          e
                        ) =>
                          updateGoal(
                            goal.id,
                            "title",
                            e.target
                              .value
                          )
                        }
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <TextField
                        label="Thrust Area"
                        fullWidth
                        disabled={
                          !canEdit
                        }
                        value={
                          goal.thrustArea
                        }
                        onChange={(
                          e
                        ) =>
                          updateGoal(
                            goal.id,
                            "thrustArea",
                            e.target
                              .value
                          )
                        }
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                      }}
                    >
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        disabled={
                          !canEdit
                        }
                        value={
                          goal.description
                        }
                        onChange={(
                          e
                        ) =>
                          updateGoal(
                            goal.id,
                            "description",
                            e.target
                              .value
                          )
                        }
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        md: 4,
                      }}
                    >
                      <TextField
                        select
                        label="UOM"
                        fullWidth
                        disabled={
                          !canEdit
                        }
                        value={
                          goal.uom
                        }
                        onChange={(
                          e
                        ) =>
                          updateGoal(
                            goal.id,
                            "uom",
                            e.target
                              .value
                          )
                        }
                      >
                        <MenuItem value="NUMERIC">
                          NUMERIC
                        </MenuItem>

                        <MenuItem value="PERCENTAGE">
                          PERCENTAGE
                        </MenuItem>

                        <MenuItem value="TIMELINE">
                          TIMELINE
                        </MenuItem>

                        <MenuItem value="ZERO_BASED">
                          ZERO_BASED
                        </MenuItem>
                      </TextField>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        md: 4,
                      }}
                    >
                      <TextField
                        label="Target"
                        type="number"
                        fullWidth
                        disabled={
                          !canEdit
                        }
                        value={
                          goal.target
                        }
                        onChange={(
                          e
                        ) =>
                          updateGoal(
                            goal.id,
                            "target",
                            Number(
                              e.target
                                .value
                            )
                          )
                        }
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        md: 4,
                      }}
                    >
                      <TextField
                        label="Weightage (%)"
                        type="number"
                        fullWidth
                        disabled={
                          !canEdit
                        }
                        value={
                          goal.weightage
                        }
                        onChange={(
                          e
                        ) =>
                          updateGoal(
                            goal.id,
                            "weightage",
                            Number(
                              e.target
                                .value
                            )
                          )
                        }
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <Typography
  sx={{ fontWeight: 'bold' }}
  gutterBottom
>
                        Progress
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={
                          goal.progress
                        }
                        sx={{
                          height: 10,
                          borderRadius: 5,
                        }}
                      />

                      <Typography sx={{ mt: 1 }}>
                        {
                          goal.progress
                        }
                        %
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                     <Typography
  sx={{ fontWeight: 'bold' }}
  gutterBottom
>
                        Achievement
                      </Typography>

                      <Typography>
                        {
                          goal.achievement
                        }
                      </Typography>
                    </Grid>

                    {goal.managerFeedback && (
                      <Grid
                        size={{
                          xs: 12,
                        }}
                      >
                        <Alert severity="info">
                         <Typography
  sx={{ fontWeight: 'bold' }}
>
                            Manager
                            Feedback
                          </Typography>

                          {
                            goal.managerFeedback
                          }
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )
        )}
      </Grid>

      <Dialog
        open={
          unlockDialog
        }
        onClose={() =>
          setUnlockDialog(
            false
          )
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Request Goal
          Sheet Unlock
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Provide a valid
            reason for
            unlocking your
            approved goal
            sheet.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason"
            value={
              unlockReason
            }
            onChange={(e) =>
              setUnlockReason(
                e.target.value
              )
            }
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setUnlockDialog(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="warning"
            onClick={
              requestUnlock
            }
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}