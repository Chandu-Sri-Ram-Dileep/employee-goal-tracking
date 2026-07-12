"use client";
import { useState } from "react";
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
} from "@mui/material";

interface UnlockRequest {
  requestId: string;
  employeeName: string;
  department: string;
  goalSheetId: string;
  reason: string;
  requestedDate: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
}

const mockRequests: UnlockRequest[] = [
  {
    requestId: "UR001",

    employeeName: "John Doe",

    department: "Sales",

    goalSheetId: "GS001",

    reason:
      "Need to revise revenue target after management discussion.",

    requestedDate: "2026-06-15",

    status: "PENDING",
  },

  {
    requestId: "UR002",

    employeeName: "Jane Smith",

    department: "Engineering",

    goalSheetId: "GS002",

    reason:
      "Weightage distribution needs correction.",

    requestedDate: "2026-06-15",

    status: "PENDING",
  },
];

export default function UnlockRequestsPage() {
  const [requests, setRequests] =
    useState(mockRequests);

  const [selectedRequest, setSelectedRequest] =
    useState<UnlockRequest | null>(
      null
    );

  const [open, setOpen] =
    useState(false);

  const [adminComments, setAdminComments] =
    useState("");

  const handleReview = (
    request: UnlockRequest
  ) => {
    setSelectedRequest(request);
    setOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    /*
    ======================================

    PUT /api/admin/unlock-request/{id}/approve

    Request

    {
      comments:
      adminComments
    }

    Backend Actions

    1. Mark request APPROVED

    2. Unlock Goal Sheet

    UPDATE goal_sheet
    SET locked = false

    ======================================
    */

    console.log(
      "APPROVE REQUEST",
      selectedRequest
    );

    setRequests((prev) =>
      prev.map((req) =>
        req.requestId ===
        selectedRequest.requestId
          ? {
              ...req,
              status: "APPROVED",
            }
          : req
      )
    );

    setOpen(false);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    /*
    ======================================

    PUT /api/admin/unlock-request/{id}/reject

    Request

    {
      comments:
      adminComments
    }

    ======================================
    */

    console.log(
      "REJECT REQUEST",
      selectedRequest
    );

    setRequests((prev) =>
      prev.map((req) =>
        req.requestId ===
        selectedRequest.requestId
          ? {
              ...req,
              status: "REJECTED",
            }
          : req
      )
    );

    setOpen(false);
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
        sx={{ mb: 3 }}
      >
        Admin can unlock approved
        goal sheets for employee
        modifications.
      </Alert>

      {requests.map((request) => (
        <Paper
          key={request.requestId}
          sx={{
            p: 3,
            mb: 2,
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6">
              {request.employeeName}
            </Typography>

            <Typography>
              Department:
              {" "}
              {request.department}
            </Typography>

            <Typography>
              Goal Sheet:
              {" "}
              {request.goalSheetId}
            </Typography>

            <Typography>
              Requested:
              {" "}
              {request.requestedDate}
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
      ))}

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
                  selectedRequest.employeeName
                }
              </Typography>

              <Typography>
                Department:
                {" "}
                {
                  selectedRequest.department
                }
              </Typography>

              <Typography>
                Goal Sheet:
                {" "}
                {
                  selectedRequest.goalSheetId
                }
              </Typography>

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