import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function SettingsPage() {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={1}>
        <Typography variant="h4">الإعدادات</Typography>
        <Typography color="text.secondary">
          هذا القسم مخصص لإعدادات النظام، التفضيلات، وإدارة الخيارات العامة للتطبيق.
        </Typography>
      </Stack>
    </Paper>
  )
}