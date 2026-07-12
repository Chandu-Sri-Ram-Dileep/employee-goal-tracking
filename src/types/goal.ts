export type UomType =
  | "NUMERIC"
  | "PERCENTAGE"
  | "TIMELINE"
  | "ZERO_BASED";

export interface GoalFormItem {
  title: string;
  description: string;
  thrustArea: string;
  uom: UomType;
  target: string;
  weightage: number;
}
export interface Goal {
  id: string;
  title: string;
  thrustArea: string;
  target: string;
  weightage: number;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "IN_PROGRESS"
    | "COMPLETED";

  createdBy: string;

  approvedBy?: string;
}