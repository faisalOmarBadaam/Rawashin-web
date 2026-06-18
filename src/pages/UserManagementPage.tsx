import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function UserManagementPage() {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={1}>
        <Typography variant="h4">إدارة المستخدمين</Typography>
        <Typography color="text.secondary">هذه الصفحة مخصصة لإدارة حسابات المستخدمين، صلاحيات الوصول، والتحكم بالحسابات الإدارية.</Typography>
      </Stack>
    </Paper>
  )
}
