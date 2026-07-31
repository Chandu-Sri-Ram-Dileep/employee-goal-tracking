"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Skeleton,
} from "@mui/material";

interface UnlockRequest {
  id: string;
  employee: {
    user: {
      name: string;
    };
    department: string;
  };
  goalSheet: {
    id: string;
    cycle: {
      name: string;
    };
  };
  reason: string;
  requestedAt: string;
  status:
    | "PENDING_MANAGER"
    | "PENDING_ADMIN"
    | "APPROVED"
    | "REJECTED";
  managerRemarks?: string;
  adminRemarks?: string;
}

export default function UnlockRequestsPage() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] =
    useState<UnlockRequest | null>(
      null
    );

  const [open, setOpen] =
    useState(false);

  const [adminComments, setAdminComments] =
    useState("");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-unlock-requests"],
    queryFn: async () => {
      const response = await fetch("/api/admin/unlock-request");
      const data = await response.json();
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (data: { requestId: string; remarks: string }) => {
      const response = await fetch("/api/admin/unlock-request/approve", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-unlock-requests"] });
      setOpen(false);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: { requestId: string; remarks: string }) => {
      const response = await fetch("/api/admin/unlock-request/reject", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-unlock-requests"] });
      setOpen(false);
    },
  });

  const handleReview = (
    request: UnlockRequest
  ) => {
    setSelectedRequest(request);
    setAdminComments("");
    setOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    approveMutation.mutate({
      requestId: selectedRequest.id,
      remarks: adminComments,
    });
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    rejectMutation.mutate({
      requestId: selectedRequest.id,
      remarks: adminComments,
    });
  };

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Goal Unlock Requests
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3, borderRadius: 2 }}
      >
        Admin can unlock approved
        goal sheets for employee
        modifications.
      </Alert>

      {isLoading ? (
        <Box>
          {[1, 2, 3].map((i) => (
            <Paper
              key={i}
              sx={{
                p: 3,
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="30%" height={20} />
              </Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Skeleton variant="rectangular" width={80} height={32} />
                <Skeleton variant="rectangular" width={80} height={36} />
              </Box>
            </Paper>
          ))}
        </Box>
      ) : requests.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>No pending unlock requests</Alert>
      ) : (
        requests.map((request: UnlockRequest) => (
          <Paper
            key={request.id}
            sx={{
              p: 3,
              mb: 2,
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {request.employee.user.name}
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Department:
                {" "}
                {request.employee.department}
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Goal Sheet:
                {" "}
                {request.goalSheet.cycle.name}
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Requested:
                {" "}
                {new Date(request.requestedAt).toLocaleDateString()}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems:
                  "center",
              }}
            >
              <Chip
                label={request.status}
                size="small"
                color={
                  request.status ===
                  "APPROVED"
                    ? "success"
                    : request.status ===
                      "REJECTED"
                    ? "error"
                    : "warning"
                }
              />

              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  handleReview(
                    request
                  )
                }
              >
                Review
              </Button>
            </Box>
          </Paper>
        ))
      )}

      <Dialog
        open={open}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Unlock Request Review
        </DialogTitle>

        <DialogContent>
          {selectedRequest && (
            <>
              <Typography>
                Employee:
                {" "}
                {
                  selectedRequest.employee.user.name
                }
              </Typography>

              <Typography>
                Department:
                {" "}
                {
                  selectedRequest.employee.department
                }
              </Typography>

              <Typography>
                Goal Sheet:
                {" "}
                {
                  selectedRequest.goalSheet.cycle.name
                }
              </Typography>

              {selectedRequest.managerRemarks && (
                <Typography>
                  Manager Remarks:
                  {" "}
                  {selectedRequest.managerRemarks}
                </Typography>
              )}

              <Typography
                sx={{
                  mt: 2,
                  mb: 2,
                }}
              >
                Reason:
                {" "}
                {
                  selectedRequest.reason
                }
              </Typography>

              <TextField
                label="Admin Comments"
                fullWidth
                multiline
                rows={4}
                value={
                  adminComments
                }
                onChange={(e) =>
                  setAdminComments(
                    e.target.value
                  )
                }
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            color="error"
            onClick={
              handleReject
            }
          >
            Reject
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={
              handleApprove
            }
          >
            Approve Unlock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}