"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

interface Goal {
  id: string;
  title: string;
  description: string;
  thrustArea: string;
  uom: string;
  target: number;
  achievement: number;
  weightage: number;
  progress: number;
  status: string;
}

interface GoalSheet {
  id: string;

  status: string;

  submittedAt: string;

  managerRemarks: string | null;

  employee: {
    id: string;

    employeeCode: string;

    department: string;

    user: {
      name: string;

      email: string;
    };
  };

  cycle: {
    id: string;

    name: string;
  };

  goals: Goal[];
}

interface UnlockRequest {
  id: string;

  reason: string;

  requestedAt: string;

  employee: {
    employeeCode: string;

    department: string;

    user: {
      name: string;

      email: string;
    };
  };

  goalSheet: {
    id: string;

    cycle: {
      name: string;
    };
  };
}

export default function ManagerApprovalPage() {
  const [loading, setLoading] =
    useState(true);

  const [tab, setTab] =
    useState(0);

  const [
    goalSheets,
    setGoalSheets,
  ] = useState<
    GoalSheet[]
  >([]);

  const [
    unlockRequests,
    setUnlockRequests,
  ] = useState<
    UnlockRequest[]
  >([]);

  const [
    selectedGoalSheet,
    setSelectedGoalSheet,
  ] =
    useState<GoalSheet | null>(
      null
    );

  const [
    selectedUnlock,
    setSelectedUnlock,
  ] =
    useState<UnlockRequest | null>(
      null
    );

  const [
    openGoalDialog,
    setOpenGoalDialog,
  ] = useState(false);

  const [
    openUnlockDialog,
    setOpenUnlockDialog,
  ] = useState(false);

  const [
    managerRemarks,
    setManagerRemarks,
  ] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        goalRes,
        unlockRes,
      ] = await Promise.all([
        fetch(
          "/api/manager/approvals/goals"
        ),
        fetch(
          "/api/manager/approvals/unlock-request"
        ),
      ]);

      if (goalRes.ok) {
        const data =
          await goalRes.json();

        setGoalSheets(data);
      }

      if (unlockRes.ok) {
        const data =
          await unlockRes.json();

        setUnlockRequests(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function openGoalReview(
    goalSheetId: string
  ) {
    const response =
      await fetch(
        `/api/manager/approvals/goals/${goalSheetId}`
      );

    if (!response.ok) return;

    const data =
      await response.json();

    setSelectedGoalSheet(
      data
    );

    setManagerRemarks(
      data.managerRemarks || ""
    );

    setOpenGoalDialog(true);
  }

  async function openUnlockReview(
    requestId: string
  ) {
    const response =
      await fetch(
        `/api/manager/approvals/unlock-request/${requestId}`
      );

    if (!response.ok) return;

    const data =
      await response.json();

    setSelectedUnlock(data);

    setManagerRemarks("");

    setOpenUnlockDialog(true);
  }

  async function approveGoalSheet() {
    if (!selectedGoalSheet) return;

    const response =
      await fetch(
        "/api/manager/approvals/goals/approve",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            goalSheetId:
              selectedGoalSheet.id,
          }),
        }
      );

    if (!response.ok) {
      alert(
        "Failed to approve Goal Sheet"
      );
      return;
    }

    alert(
      "Goal Sheet Approved"
    );

    setOpenGoalDialog(false);

    loadData();
  }

  async function returnGoalSheet() {
    if (!selectedGoalSheet) return;

    const response =
      await fetch(
        "/api/manager/approvals/goals/return",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            goalSheetId:
              selectedGoalSheet.id,

            remarks:
              managerRemarks,
          }),
        }
      );

    if (!response.ok) {
      alert(
        "Failed to return Goal Sheet"
      );
      return;
    }

    alert(
      "Goal Sheet Returned"
    );

    setOpenGoalDialog(false);

    loadData();
  }

  async function approveUnlock() {
    if (!selectedUnlock) return;

    const response =
      await fetch(
        "/api/manager/approvals/unlock-request/approve",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            requestId:
              selectedUnlock.id,

            remarks:
              managerRemarks,
          }),
        }
      );

    if (!response.ok) {
      alert(
        "Failed to approve request"
      );
      return;
    }

    alert(
      "Request forwarded to Admin"
    );

    setOpenUnlockDialog(false);

    loadData();
  }

  async function rejectUnlock() {
    if (!selectedUnlock) return;

    const response =
      await fetch(
        "/api/manager/approvals/unlock-request/reject",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            requestId:
              selectedUnlock.id,

            remarks:
              managerRemarks,
          }),
        }
      );

    if (!response.ok) {
      alert(
        "Failed to reject request"
      );
      return;
    }

    alert(
      "Request Rejected"
    );

    setOpenUnlockDialog(false);

    loadData();
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "center",
          mt: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
            <Typography
        variant="h4"
        gutterBottom
      >
        Manager Approvals
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        Review Goal Sheet approvals and Unlock Requests submitted by your employees.
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs
            value={tab}
            onChange={(_, value) =>
              setTab(value)
            }
          >
            <Tab label="Goal Sheet Approvals" />
            <Tab label="Unlock Requests" />
          </Tabs>
        </CardContent>
      </Card>

      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
          >
            Pending Goal Sheets
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Employee Code
                </TableCell>

                <TableCell>
                  Employee
                </TableCell>

                <TableCell>
                  Department
                </TableCell>

                <TableCell>
                  Cycle
                </TableCell>

                <TableCell>
                  Submitted
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Goals
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {goalSheets.length ===
              0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                  >
                    No Goal Sheets Pending
                  </TableCell>
                </TableRow>
              ) : (
                goalSheets.map(
                  (
                    goalSheet
                  ) => (
                    <TableRow
                      key={
                        goalSheet.id
                      }
                    >
                      <TableCell>
                        {
                          goalSheet
                            .employee
                            .employeeCode
                        }
                      </TableCell>

                      <TableCell>
                        {
                          goalSheet
                            .employee
                            .user.name
                        }
                      </TableCell>

                      <TableCell>
                        {
                          goalSheet
                            .employee
                            .department
                        }
                      </TableCell>

                      <TableCell>
                        {
                          goalSheet
                            .cycle.name
                        }
                      </TableCell>

                      <TableCell>
                        {goalSheet.submittedAt
                          ? new Date(
                              goalSheet.submittedAt
                            ).toLocaleDateString()
                          : "-"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          color="warning"
                          label={
                            goalSheet.status
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            openGoalReview(
                              goalSheet.id
                            )
                          }
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
          >
            Unlock Requests
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Employee Code
                </TableCell>

                <TableCell>
                  Employee
                </TableCell>

                <TableCell>
                  Department
                </TableCell>

                <TableCell>
                  Goal Cycle
                </TableCell>

                <TableCell>
                  Requested
                </TableCell>

                <TableCell>
                  Reason
                </TableCell>

                <TableCell>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {unlockRequests.length ===
              0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                  >
                    No Unlock Requests
                  </TableCell>
                </TableRow>
              ) : (
                unlockRequests.map(
                  (
                    request
                  ) => (
                    <TableRow
                      key={
                        request.id
                      }
                    >
                      <TableCell>
                        {
                          request
                            .employee
                            .employeeCode
                        }
                      </TableCell>

                      <TableCell>
                        {
                          request
                            .employee
                            .user.name
                        }
                      </TableCell>

                      <TableCell>
                        {
                          request
                            .employee
                            .department
                        }
                      </TableCell>

                      <TableCell>
                        {
                          request
                            .goalSheet
                            .cycle.name
                        }
                      </TableCell>

                      <TableCell>
                        {new Date(
                          request.requestedAt
                        ).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {request.reason}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            openUnlockReview(
                              request.id
                            )
                          }
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
            <Dialog
        open={openGoalDialog}
        onClose={() =>
          setOpenGoalDialog(false)
        }
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Goal Sheet Review
        </DialogTitle>

        <DialogContent>
          {selectedGoalSheet && (
            <>
              <Typography
                variant="h6"
                gutterBottom
              >
                Employee Information
              </Typography>

              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                }}
              >
                <Typography>
                  <strong>Name:</strong>{" "}
                  {
                    selectedGoalSheet
                      .employee.user
                      .name
                  }
                </Typography>

                <Typography>
                  <strong>
                    Employee Code:
                  </strong>{" "}
                  {
                    selectedGoalSheet
                      .employee
                      .employeeCode
                  }
                </Typography>

                <Typography>
                  <strong>
                    Department:
                  </strong>{" "}
                  {
                    selectedGoalSheet
                      .employee
                      .department
                  }
                </Typography>

                <Typography>
                  <strong>
                    Goal Cycle:
                  </strong>{" "}
                  {
                    selectedGoalSheet
                      .cycle.name
                  }
                </Typography>
              </Paper>

              <Typography
                variant="h6"
                gutterBottom
              >
                Goals
              </Typography>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Title
                    </TableCell>

                    <TableCell>
                      Thrust Area
                    </TableCell>

                    <TableCell>
                      Target
                    </TableCell>

                    <TableCell>
                      UOM
                    </TableCell>

                    <TableCell>
                      Weightage
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedGoalSheet.goals.map(
                    (goal) => (
                      <TableRow
                        key={goal.id}
                      >
                        <TableCell>
                          {goal.title}
                        </TableCell>

                        <TableCell>
                          {
                            goal.thrustArea
                          }
                        </TableCell>

                        <TableCell>
                          {
                            goal.target
                          }
                        </TableCell>

                        <TableCell>
                          {goal.uom}
                        </TableCell>

                        <TableCell>
                          {
                            goal.weightage
                          }
                          %
                        </TableCell>
                      </TableRow>
                    )
                  )}

                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="right"
                    >
                      <strong>
                        Total
                      </strong>
                    </TableCell>

                    <TableCell>
                      <strong>
                        {selectedGoalSheet.goals.reduce(
                          (
                            total,
                            goal
                          ) =>
                            total +
                            goal.weightage,
                          0
                        )}
                        %
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Manager Remarks"
                  value={
                    managerRemarks
                  }
                  onChange={(e) =>
                    setManagerRemarks(
                      e.target.value
                    )
                  }
                />
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenGoalDialog(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            color="warning"
            variant="contained"
            onClick={
              returnGoalSheet
            }
          >
            Return
          </Button>

          <Button
            color="success"
            variant="contained"
            onClick={
              approveGoalSheet
            }
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
            <Dialog
        open={openUnlockDialog}
        onClose={() =>
          setOpenUnlockDialog(false)
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Unlock Request Review
        </DialogTitle>

        <DialogContent>
          {selectedUnlock && (
            <>
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                }}
              >
                <Typography>
                  <strong>Employee:</strong>{" "}
                  {
                    selectedUnlock
                      .employee.user
                      .name
                  }
                </Typography>

                <Typography>
                  <strong>
                    Employee Code:
                  </strong>{" "}
                  {
                    selectedUnlock
                      .employee
                      .employeeCode
                  }
                </Typography>

                <Typography>
                  <strong>
                    Department:
                  </strong>{" "}
                  {
                    selectedUnlock
                      .employee
                      .department
                  }
                </Typography>

                <Typography>
                  <strong>
                    Goal Cycle:
                  </strong>{" "}
                  {
                    selectedUnlock
                      .goalSheet
                      .cycle.name
                  }
                </Typography>

                <Typography
                  sx={{ mt: 2 }}
                >
                  <strong>
                    Employee Reason
                  </strong>
                </Typography>

                <Typography>
                  {
                    selectedUnlock.reason
                  }
                </Typography>
              </Paper>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Manager Remarks"
                value={
                  managerRemarks
                }
                onChange={(e) =>
                  setManagerRemarks(
                    e.target.value
                  )
                }
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenUnlockDialog(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              rejectUnlock
            }
          >
            Reject
          </Button>

          <Button
            color="success"
            variant="contained"
            onClick={
              approveUnlock
            }
          >
            Forward to Admin
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}