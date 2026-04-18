'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type Props = {
  onRefresh: () => void
}

export default function SupportTicketsToolbar({ onRefresh }: Props) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box className='flex flex-wrap gap-3 justify-between items-center'>
        <Typography variant='h5'>تذاكر الدعم الفني</Typography>

        <Box className='flex gap-2 flex-wrap'>
          <Button variant='outlined' startIcon={<i className='ri-refresh-line' />} onClick={onRefresh}>
            تحديث
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
