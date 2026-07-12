export interface Employee {
  id: string;
  employeeCode: string;

  department: string;
  designation: string;

  gender: string;

  phone?: string;
  address?: string;

  status: "ACTIVE" | "INACTIVE";

  user: {
    id: string;
    name: string;
    email: string;
  };

  manager?: {
    id: string;
    managerCode: string;

    user: {
      name: string;
      email: string;
    };
  } | null;
}

export interface Manager {
  id: string;
  managerCode: string;

  department: string;

  user: {
    name: string;
    email: string;
  };
}