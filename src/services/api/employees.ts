export async function getEmployees() {
  const res = await fetch(
    "/api/admin/employees"
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch employees"
    );
  }

  return res.json();
}

export async function createEmployee(
  payload: unknown
) {
  const res = await fetch(
    "/api/admin/employees/create",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        payload
      ),
    }
  );

  return res.json();
}

export async function updateEmployee(
  id: string,
  payload: unknown
) {
  const res = await fetch(
    `/api/admin/employees/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        payload
      ),
    }
  );

  return res.json();
}

export async function toggleEmployeeStatus(
  id: string
) {
  const res = await fetch(
    `/api/admin/employees/${id}/status`,
    {
      method: "PUT",
    }
  );

  return res.json();
}