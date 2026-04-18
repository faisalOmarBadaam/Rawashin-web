import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type TimelineItem = {
  label: string
  date?: string | null
  icon: string
  active?: boolean
}

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '—'

export default function SettlementTimeline({
  items
}: {
  items: TimelineItem[]
}) {
  return (
    <Stack spacing={0}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <Stack key={item.label} direction="row" spacing={2}>
            <Stack alignItems="center">
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  bgcolor: item.active ? 'primary.main' : 'grey.300',
                  color: item.active ? '#fff' : 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className={item.icon} />
              </Box>

              {!isLast && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    bgcolor: 'divider',
                    my: 0.5
                  }}
                />
              )}
            </Stack>

            <Box pb={3}>
              <Typography
                fontWeight={item.active ? 700 : 500}
                color={item.active ? 'primary.main' : 'text.primary'}
              >
                {item.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDateTime(item.date)}
              </Typography>
            </Box>
          </Stack>
        )
      })}
    </Stack>
  )
}
