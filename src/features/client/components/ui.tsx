import { Box, Divider, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function TabPanel({ children, value, index }: { children?: ReactNode; value: number; index: number }) {
  if (value !== index) return null
  return <Box>{children}</Box>
}

export function InfoSection({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}

      <Box>{children}</Box>
    </Box>
  )
}

export function DetailItem({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value != null && value !== '' ? value : '—'}</Typography>
      <Divider sx={{ mt: 1 }} />
    </Box>
  )
}
