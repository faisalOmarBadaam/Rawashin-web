import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function SupportPage() {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={1}>
        <Typography variant="h4">ميزة الدعم الفني</Typography>
        <Typography color="text.secondary">هذه الصفحة مخصصة لتذاكر الدعم الفني، المتابعة، التصعيد، وسجل المعالجة.</Typography>
      </Stack>
    </Paper>
  )
}