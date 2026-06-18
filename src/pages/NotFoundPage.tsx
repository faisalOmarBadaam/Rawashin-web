import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function NotFoundPage() {
  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={1}>
        <Typography variant="h4">الصفحة غير موجودة</Typography>
        <Typography color="text.secondary">
          المسار المطلوب غير متوفر حاليًا. تحقق من الرابط أو عد إلى إحدى صفحات النظام.
        </Typography>
      </Stack>
    </Paper>
  )
}