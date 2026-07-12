import Chip from "@mui/material/Chip";
interface Props {
  status: string;
}
export default function GoalStatusChip({
  status,
}: Props) {
  const colorMap: Record<
    string,
    "default" | "primary" | "success" | "warning" | "error"
  > = {
    DRAFT: "default",
    SUBMITTED: "primary",
    UNDER_REVIEW: "warning",
    APPROVED: "success",
    REJECTED: "error",
    IN_PROGRESS: "primary",
    COMPLETED: "success",
  };
  return (
    <Chip
      label={status.replaceAll("_", " ")}
      color={colorMap[status]}
      size="small"
    />
  );
}