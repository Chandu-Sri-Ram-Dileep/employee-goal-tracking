"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

interface Employee {
  id: string;

  employeeCode: string;

  department: string;

  designation: string;

  gender: string;

  phone?: string;

  address?: string;

  status: string;

  user: {
    name: string;
    email: string;
  };

  manager?: {
    managerCode: string;

    user: {
      name: string;
      email: string;
    };
  } | null;

  profile?: {
    summary?: string;

    totalExperience?: number;

    linkedinUrl?: string;

    githubUrl?: string;

    portfolioUrl?: string;

    educations: any[];

    projects: any[];

    certifications: any[];

    responsibilities: any[];
  } | null;
}

export default function EmployeeProfilePage() {
  const params = useParams();

  const employeeId =
    params.id as string;

  const [employee, setEmployee] =
    useState<Employee | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const fetchEmployee =
    async () => {
      try {
        const response =
          await fetch(
            `/api/admin/employees/${employeeId}`
          );

        const data =
          await response.json();

        setEmployee(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <Box
        sx={{
          height: "60vh",
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Alert severity="error">
        Employee not found
      </Alert>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Employee Profile
      </Typography>

      <Grid
        container
        spacing={3}
      >
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography
                variant="h5"
              >
                {
                  employee.user
                    .name
                }
              </Typography>

              <Typography>
                Employee Code:
                {" "}
                {
                  employee.employeeCode
                }
              </Typography>

              <Typography>
                Email:
                {" "}
                {
                  employee.user
                    .email
                }
              </Typography>

              <Typography>
                Department:
                {" "}
                {
                  employee.department
                }
              </Typography>

              <Typography>
                Designation:
                {" "}
                {
                  employee.designation
                }
              </Typography>

              <Typography>
                Gender:
                {" "}
                {
                  employee.gender
                }
              </Typography>

              <Typography>
                Phone:
                {" "}
                {employee.phone ||
                  "N/A"}
              </Typography>

              <Typography>
                Address:
                {" "}
                {employee.address ||
                  "N/A"}
              </Typography>

              <Typography>
                Status:
                {" "}
                {
                  employee.status
                }
              </Typography>

              <Typography>
                Manager:
                {" "}
                {employee.manager
                  ?.user.name ||
                  "Not Assigned"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Paper
            sx={{ p: 3 }}
          >
            <Typography
              variant="h6"
            >
              Professional Summary
            </Typography>

            <Divider
              sx={{ my: 2 }}
            />

            <Typography>
              {employee.profile
                ?.summary ||
                "No summary added"}
            </Typography>

            <Box sx={{
                mt:2,
                }}>
              <Typography>
                Experience:
                {" "}
                {employee.profile
                  ?.totalExperience ||
                  0}
                {" "}
                Years
              </Typography>

              <Typography>
                LinkedIn:
                {" "}
                {employee.profile
                  ?.linkedinUrl ||
                  "-"}
              </Typography>

              <Typography>
                Github:
                {" "}
                {employee.profile
                  ?.githubUrl ||
                  "-"}
              </Typography>

              <Typography>
                Portfolio:
                {" "}
                {employee.profile
                  ?.portfolioUrl ||
                  "-"}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper
            sx={{ p: 3 }}
          >
            <Typography
              variant="h6"
            >
              Education
            </Typography>

            <Divider
              sx={{ my: 2 }}
            />

            {employee.profile
              ?.educations
              ?.length ? (
              employee.profile.educations.map(
                (
                  education,
                  index
                ) => (
                 <Box
  key={index}
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

                    <Typography>
                      {
                        education.specialization
                      }
                    </Typography>

                    <Typography>
                      Score:
                      {" "}
                      {
                        education.score
                      }
                    </Typography>
                  </Box>
                )
              )
            ) : (
              <Typography>
                No education
                details
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper
            sx={{ p: 3 }}
          >
            <Typography
              variant="h6"
            >
              Projects
            </Typography>

            <Divider
              sx={{ my: 2 }}
            />

            {employee.profile
              ?.projects
              ?.length ? (
              employee.profile.projects.map(
                (
                  project,
                  index
                ) => (
                  <Box
  key={index}
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

                    <Typography>
                      Tech:
                      {" "}
                      {
                        project.technologies
                      }
                    </Typography>
                  </Box>
                )
              )
            ) : (
              <Typography>
                No projects
                added
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper
            sx={{ p: 3 }}
          >
            <Typography
              variant="h6"
            >
              Certifications
            </Typography>

            <Divider
              sx={{ my: 2 }}
            />

            {employee.profile
              ?.certifications
              ?.length ? (
              employee.profile.certifications.map(
                (
                  cert,
                  index
                ) => (
                  <Box
  key={index}
  sx={{
    mb: 2,
  }}
>
                    <Typography
  sx={{
    fontWeight: "bold",
  }}
>
                      {cert.name}
                    </Typography>

                    <Typography>
                      {
                        cert.provider
                      }
                    </Typography>
                  </Box>
                )
              )
            ) : (
              <Typography>
                No certifications
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper
            sx={{ p: 3 }}
          >
            <Typography
              variant="h6"
            >
              Positions Of
              Responsibility
            </Typography>

            <Divider
              sx={{ my: 2 }}
            />

            {employee.profile
              ?.responsibilities
              ?.length ? (
              employee.profile.responsibilities.map(
                (
                  item,
                  index
                ) => (
                  <Box
  key={index}
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
                        item.title
                      }
                    </Typography>

                    <Typography>
                      {
                        item.organization
                      }
                    </Typography>

                    <Typography>
                      {
                        item.description
                      }
                    </Typography>
                  </Box>
                )
              )
            ) : (
              <Typography>
                No positions
                added
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}