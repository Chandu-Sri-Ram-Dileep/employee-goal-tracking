import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

interface Props {
  title: string;
  value: string;
}

export default function KpiCard({
  title,
  value,
}: Props) {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary">
          {title}
        </Typography>

        <Typography
  variant="h4"
  sx={{
    fontWeight: 700,
  }}
>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}