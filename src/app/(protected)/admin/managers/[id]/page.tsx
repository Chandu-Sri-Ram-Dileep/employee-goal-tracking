"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

interface Manager {
  id: string;

  managerCode: string;

  department: string;

  gender: string;

  phone: string | null;

  address: string | null;

  status: string;

  createdAt: string;

  user: {
    id: string;
    name: string;
    email: string;
  };

  employees: {
    id: string;

    employeeCode: string;

    department: string;

    designation: string;

    user: {
      name: string;
      email: string;
    };
  }[];

  profile: {
    id: string;

    summary: string | null;

    totalExperience: number | null;

    linkedinUrl: string | null;

    educations: {
      id: string;

      qualification: string;

      institution: string;

      specialization: string | null;

      score: string | null;

      startYear: number | null;

      endYear: number | null;
    }[];

    projects: {
      id: string;

      title: string;

      description: string;

      technologies: string;

      githubUrl: string | null;

      liveUrl: string | null;
    }[];

    certifications: {
      id: string;

      name: string;

      provider: string;
    }[];

    responsibilities: {
      id: string;

      title: string;

      organization: string;

      description: string | null;
    }[];
  } | null;
}

export default function ManagerProfilePage() {
  const params = useParams();

  const managerId =
    params.id as string;

  const [manager, setManager] =
    useState<Manager | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchManager =
    async () => {
      try {
        const response =
          await fetch(
            `/api/admin/managers/${managerId}`
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to fetch manager"
          );

          return;
        }

        setManager(data);
      } catch (err) {
        console.error(err);

        setError(
          "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (managerId) {
      fetchManager();
    }
  }, [managerId]);

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

  if (error || !manager) {
    return (
      <Alert severity="error">
        {error ||
          "Manager not found"}
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">
          Manager Profile
        </Typography>

        <Button
          variant="contained"
        >
          Edit Profile
        </Button>
      </Box>

      <Grid
        container
        spacing={3}
      >
              <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
              >
                Basic Information
              </Typography>

              <Divider
                sx={{ mb: 2 }}
              />

              <Typography>
                <strong>
                  Manager Code:
                </strong>{" "}
                {manager.managerCode}
              </Typography>

              <Typography>
                <strong>
                  Name:
                </strong>{" "}
                {manager.user.name}
              </Typography>

              <Typography>
                <strong>
                  Email:
                </strong>{" "}
                {manager.user.email}
              </Typography>

              <Typography>
                <strong>
                  Department:
                </strong>{" "}
                {manager.department}
              </Typography>

              <Typography>
                <strong>
                  Gender:
                </strong>{" "}
                {manager.gender}
              </Typography>

              <Typography>
                <strong>
                  Phone:
                </strong>{" "}
                {manager.phone ||
                  "-"}
              </Typography>

              <Typography>
                <strong>
                  Address:
                </strong>{" "}
                {manager.address ||
                  "-"}
              </Typography>

              <Box
                sx={{ mt: 2 }}
              >
                <Chip
                  label={
                    manager.status
                  }
                  color={
                    manager.status ===
                    "ACTIVE"
                      ? "success"
                      : "error"
                  }
                />
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{ mt: 3 }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
              >
                Reporting Employees
              </Typography>

              <Divider
                sx={{ mb: 2 }}
              />

              {manager
                .employees
                .length ===
              0 ? (
                <Typography>
                  No employees
                  assigned.
                </Typography>
              ) : (
                manager.employees.map(
                  (
                    employee
                  ) => (
                    <Box
                      key={
                        employee.id
                      }
                      sx={{
                        mb: 2,
                      }}
                    >
                      <Link
                        href={`/admin/employees/${employee.id}`}
                        style={{
                          textDecoration:
                            "none",
                          color:
                            "#1976d2",
                          fontWeight:
                            600,
                        }}
                      >
                        {
                          employee
                            .user
                            .name
                        }
                      </Link>

                      <Typography
                        variant="body2"
                      >
                        {
                          employee.employeeCode
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                      >
                        {
                          employee.designation
                        }
                      </Typography>

                      <Divider
                        sx={{
                          mt: 1,
                        }}
                      />
                    </Box>
                  )
                )
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
              >
                Professional Summary
              </Typography>

              <Divider
                sx={{ mb: 2 }}
              />

              <Typography>
                {manager
                  .profile
                  ?.summary ||
                  "No summary available"}
              </Typography>

              <Box
                sx={{ mt: 3 }}
              >
                <Typography>
                  <strong>
                    Total Experience:
                  </strong>{" "}
                  {manager
                    .profile
                    ?.totalExperience ??
                    "-"}{" "}
                  Years
                </Typography>

                <Typography>
                  <strong>
                    LinkedIn:
                  </strong>{" "}
                  {manager
                    .profile
                    ?.linkedinUrl ? (
                    <a
                      href={
                        manager
                          .profile
                          .linkedinUrl
                      }
                      target="_blank"
                    >
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Paper
            sx={{
              mt: 3,
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
            >
              Education
            </Typography>

            <Divider
              sx={{ mb: 2 }}
            />
                        {manager.profile
              ?.educations
              ?.length ? (
              manager.profile.educations.map(
                (
                  education
                ) => (
                  <Box
                    key={
                      education.id
                    }
                    sx={{
                      mb: 2,
                    }}
                  >
                    <Typography
  sx={{
    fontWeight: "bold",
  }}
>
                      {
                        education.qualification
                      }
                    </Typography>

                    <Typography>
                      {
                        education.institution
                      }
                    </Typography>

                    <Typography variant="body2">
                      {
                        education.specialization
                      }
                    </Typography>

                    <Typography variant="body2">
                      {
                        education.startYear
                      }{" "}
                      -
                      {" "}
                      {
                        education.endYear
                      }
                    </Typography>

                    <Divider
                      sx={{
                        mt: 1,
                      }}
                    />
                  </Box>
                )
              )
            ) : (
              <Typography>
                No education
                records available.
              </Typography>
            )}
          </Paper>

          <Paper
            sx={{
              mt: 3,
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
            >
              Certifications
            </Typography>

            <Divider
              sx={{ mb: 2 }}
            />

            {manager.profile
              ?.certifications
              ?.length ? (
              manager.profile.certifications.map(
                (
                  certification
                ) => (
                  <Box
                    key={
                      certification.id
                    }
                    sx={{
                      mb: 2,
                    }}
                  >
                    <Typography
  sx={{
    fontWeight: "bold",
  }}
>
                      {
                        certification.name
                      }
                    </Typography>

                    <Typography>
                      {
                        certification.provider
                      }
                    </Typography>

                    <Divider
                      sx={{
                        mt: 1,
                      }}
                    />
                  </Box>
                )
              )
            ) : (
              <Typography>
                No certifications
                available.
              </Typography>
            )}
          </Paper>

          <Paper
            sx={{
              mt: 3,
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
            >
              Projects
            </Typography>

            <Divider
              sx={{ mb: 2 }}
            />

            {manager.profile
              ?.projects
              ?.length ? (
              manager.profile.projects.map(
                (
                  project
                ) => (
                  <Box
                    key={
                      project.id
                    }
                    sx={{
                      mb: 2,
                    }}
                  >
                    <Typography
  sx={{
    fontWeight: "bold",
  }}
>
                      {
                        project.title
                      }
                    </Typography>

                    <Typography>
                      {
                        project.description
                      }
                    </Typography>

                    <Typography variant="body2">
                      Technologies:
                      {" "}
                      {
                        project.technologies
                      }
                    </Typography>

                    <Divider
                      sx={{
                        mt: 1,
                      }}
                    />
                  </Box>
                )
              )
            ) : (
              <Typography>
                No projects
                available.
              </Typography>
            )}
          </Paper>

          <Paper
            sx={{
              mt: 3,
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
            >
              Positions of
              Responsibility
            </Typography>

            <Divider
              sx={{ mb: 2 }}
            />

            {manager.profile
              ?.responsibilities
              ?.length ? (
              manager.profile.responsibilities.map(
                (
                  responsibility
                ) => (
                  <Box
                    key={
                      responsibility.id
                    }
                    sx={{
                      mb: 2,
                    }}
                  >
                   <Typography
  sx={{
    fontWeight: "bold",
  }}
>
                      {
                        responsibility.title
                      }
                    </Typography>

                    <Typography>
                      {
                        responsibility.organization
                      }
                    </Typography>

                    <Typography>
                      {
                        responsibility.description
                      }
                    </Typography>

                    <Divider
                      sx={{
                        mt: 1,
                      }}
                    />
                  </Box>
                )
              )
            ) : (
              <Typography>
                No positions of
                responsibility
                available.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}