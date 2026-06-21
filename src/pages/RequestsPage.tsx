import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function RequestsPage() {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={1}>
        <Typography variant="h4">الطلبات</Typography>
        <Typography color="text.secondary">
          هذه الصفحة مخصصة لعرض وإدارة الطلبات المرتبطة بالعملاء ومتابعة حالاتها.
        </Typography>
      </Stack>
    </Paper>
  )
}