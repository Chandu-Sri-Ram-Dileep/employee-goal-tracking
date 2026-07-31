"use client";

import {
  Alert,
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SecurityIcon from "@mui/icons-material/Security";
import ShieldIcon from "@mui/icons-material/Shield";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StorageIcon from "@mui/icons-material/Storage";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

export default function TermsAndConditionsPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f172a",
        color: "#f8fafc",
        py: { xs: 4, md: 8 },
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => window.history.back()}
            sx={{ color: "#94a3b8", "&:hover": { color: "#fff" }, textTransform: "none" }}
          >
            Back
          </Button>
          <Chip
            icon={<ShieldIcon sx={{ color: "#6366f1 !important" }} />}
            label="Industrial Enterprise Compliance"
            size="small"
            sx={{ bgcolor: "rgba(99, 102, 241, 0.15)", color: "#818cf8", border: "1px solid rgba(99, 102, 241, 0.3)" }}
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            bgcolor: "rgba(30, 41, 59, 0.9)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 3,
            color: "#f8fafc",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                display: "flex",
                color: "#fff",
              }}
            >
              <PrecisionManufacturingIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                Terms of Service & Data Privacy Policy
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5 }}>
                GoalTrack Enterprise Performance Management System • Last Updated: July 2026
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", my: 3 }} />

          {/* Section 1: Overview */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#6366f1", mb: 1 }}>
              1. Enterprise Purpose & Scope
            </Typography>
            <Typography variant="body2" sx={{ color: "#cbd5e1", lineHeight: 1.7 }}>
              GoalTrack provides an industrial-grade Performance Management System (PMS) designed for goal setting, target execution tracking, check-in reviews, and organizational analytics. By accessing or using this system, employees, managers, and administrators agree to adhere to company performance governance and data protection protocols.
            </Typography>
          </Box>

          {/* Section 2: Data Collected */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#6366f1", mb: 1 }}>
              2. Data Collected & Processed
            </Typography>
            <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2, lineHeight: 1.7 }}>
              GoalTrack collects and processes only data relevant to employment, organizational structure, and goal execution metrics:
            </Typography>

            <List sx={{ py: 0 }}>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: "#818cf8" }}>
                  <StorageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Personal Identity & Contact Information</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "#94a3b8" }}>Full Name, Email Address, Employee Code, Manager Code, Phone Number, Office Address, Gender, and Profile Avatar Photo.</Typography>}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: "#818cf8" }}>
                  <StorageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Performance & Goal Metrics</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "#94a3b8" }}>Goal Titles, Descriptions, Thrust Areas, Units of Measurement (UOM), Target values, Achievements, Progress percentages, Weightages, and Manager feedback notes.</Typography>}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: "#818cf8" }}>
                  <StorageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Check-ins & Review Logs</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "#94a3b8" }}>Self-submitted achievement records, employee check-in comments, manager approval timestamps, and unlock request justifications.</Typography>}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: "#818cf8" }}>
                  <StorageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>System Audits & Security Logs</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "#94a3b8" }}>Authentication timestamps, IP audit trail logs, password change audit entries, and role authorization events.</Typography>}
                />
              </ListItem>
            </List>
          </Box>

          {/* Section 3: Data Sharing & RBAC Boundaries */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#6366f1", mb: 1 }}>
              3. Data Access, Role-Based Access Control (RBAC) & Sharing
            </Typography>
            <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2, lineHeight: 1.7 }}>
              GoalTrack enforces strict Role-Based Access Control (RBAC). Data is isolated and shared strictly on a need-to-know basis within organizational hierarchy:
            </Typography>

            <List sx={{ py: 0 }}>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: "#10b981" }}>
                  <VisibilityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Employee View</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "#94a3b8" }}>Employees have full access to their own goal sheets, check-in history, personal profile, and direct feedback provided by their assigned manager.</Typography>}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: "#f59e0b" }}>
                  <VisibilityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Manager View</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "#94a3b8" }}>Managers can view and evaluate data belonging strictly to their direct reports. Managers cannot access goal sheets of employees outside their team structure.</Typography>}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: "#ef4444" }}>
                  <VisibilityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>System Administrator View</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "#94a3b8" }}>Administrators maintain system-wide governance, user provisioning, goal cycle creation, unlock request final approvals, and audit log monitoring.</Typography>}
                />
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2, bgcolor: "rgba(99, 102, 241, 0.1)", color: "#c7d2fe", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
              <strong>Zero External Commercial Sharing:</strong> GoalTrack never sells, rents, monetizes, or shares employee data or performance metrics with external third-party advertisers or data brokers.
            </Alert>
          </Box>

          {/* Section 4: Security & Encryption */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#6366f1", mb: 1 }}>
              4. Security Standards & Encryption
            </Typography>
            <Typography variant="body2" sx={{ color: "#cbd5e1", lineHeight: 1.7 }}>
              GoalTrack implements enterprise security controls including <strong>Bcrypt password hashing</strong>, <strong>JWT token authentication</strong>, <strong>HTTPS/TLS transport security</strong>, and <strong>Immutable Audit Trails</strong> for administrative actions.
            </Typography>
          </Box>

          {/* Section 5: User Rights */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#6366f1", mb: 1 }}>
              5. Employee Data Rights & Support
            </Typography>
            <Typography variant="body2" sx={{ color: "#cbd5e1", lineHeight: 1.7 }}>
              Employees have the right to inspect their recorded goals, profile details, and check-in history. Profile information can be updated via the Employee Profile page. For data corrections or compliance inquiries, contact your Human Resources department or System Administrator.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
