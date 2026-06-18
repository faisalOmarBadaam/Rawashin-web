import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const stats = [
  { title: 'إجمالي الفنادق', value: '24' },
  { title: 'الحجوزات النشطة', value: '1,284' },
  { title: 'الإشعارات الجديدة', value: '18' },
]

export default function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">لوحة التحكم</Typography>
        <Typography color="text.secondary">
          نظرة سريعة على أهم مؤشرات التشغيل داخل النظام.
        </Typography>
      </Stack>
      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, md: 4 }}>
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography color="text.secondary">{stat.title}</Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}