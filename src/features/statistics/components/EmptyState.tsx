import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Icon } from '@iconify/react'

export function EmptyState() {  
  return (
    <Card sx={{ width: '100%' }}>
      <CardContent
        sx={{
          minHeight: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack spacing={2} sx={{alignItems : 'center' ,textAlign :'center'}}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Icon icon="mdi:chart-donut" fontSize={30} />
          </Box>
          <Typography variant="h6" sx={{fontWeight : 800}}>
            لا توجد بيانات كافية حالياً
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
            قم بتوسيع نطاق البيانات أو التحقق من وجود عمليات ضمن الفترة الحالية.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}