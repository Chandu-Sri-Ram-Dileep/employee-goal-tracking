"use client";

import {
  Alert,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
} from "@mui/material";

const goalSheet = {
  id: "GS001",

  employeeName: "John Doe",

  status: "APPROVED",

  approvedBy: "Manager Smith",

  approvedDate: "2026-06-12",

  locked: true,

  goals: [
    {
      title: "Increase Revenue",

      description:
        "Increase annual revenue through upselling and cross-selling initiatives.",

      thrustArea: "Sales",

      uom: "PERCENTAGE",

      target: "20%",

      weightage: 40,
    },

    {
      title: "Acquire Clients",

      description:
        "Acquire 50 new enterprise customers.",

      thrustArea: "Sales",

      uom: "NUMERIC",

      target: "50",

      weightage: 60,
    },
  ],
};

export default function GoalSheetDetailsPage() {
  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Goal Sheet Details
      </Typography>

      {/* ======================
          BACKEND FETCH

          GET /api/goalsheet/{id}

          Response:

          {
            id,
            employeeName,
            status,
            approvedBy,
            approvedDate,
            locked,
            goals:[]
          }

      ====================== */}

      <Paper
        sx={{
          p: 3,
          mb: 3,
        }}
      >
        <Typography>
          Employee:
          {" "}
          {
            goalSheet.employeeName
          }
        </Typography>

        <Typography>
          Approved By:
          {" "}
          {
            goalSheet.approvedBy
          }
        </Typography>

        <Typography>
          Approved Date:
          {" "}
          {
            goalSheet.approvedDate
          }
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Chip
            label={
              goalSheet.status
            }
            color="success"
          />
        </Box>
      </Paper>

      {goalSheet.locked && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
        >
          🔒 This Goal Sheet is
          locked after manager
          approval. Contact Admin
          for modifications.
        </Alert>
      )}

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Title
              </TableCell>

              <TableCell>
                Description
              </TableCell>

              <TableCell>
                Thrust Area
              </TableCell>

              <TableCell>
                UOM
              </TableCell>

              <TableCell>
                Target
              </TableCell>

              <TableCell>
                Weightage
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {goalSheet.goals.map(
              (
                goal,
                index
              ) => (
                <TableRow
                  key={index}
                >
                  <TableCell>
                    {goal.title}
                  </TableCell>

                  <TableCell>
                    {
                      goal.description
                    }
                  </TableCell>

                  <TableCell>
                    {
                      goal.thrustArea
                    }
                  </TableCell>

                  <TableCell>
                    {goal.uom}
                  </TableCell>

                  <TableCell>
                    {
                      goal.target
                    }
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
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          disabled={
            goalSheet.locked
          }
        >
          Edit Goal Sheet
        </Button>
      </Box>
    </Box>
  );
}