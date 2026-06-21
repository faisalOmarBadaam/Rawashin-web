import Timeline from '@mui/lab/Timeline'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import type { ChipProps } from '@mui/material/Chip'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import {
  getSettlementStatusMeta,
  SettlementStatus,
  type SettlementDetailsResponse,
} from '../types'
import { formatDate } from '../../../shared/utils'

type TimelineStep = {
  id: string
  title: string
  description: string
  date?: string | null
  color: ChipProps['color']
  done: boolean
}

type TimelineDotColor = 'primary' | 'secondary' | 'inherit' | 'grey' | 'success' | 'error' | 'info' | 'warning'

function buildTimelineSteps(settlement: SettlementDetailsResponse): TimelineStep[] {
  const statusMeta = getSettlementStatusMeta(settlement.status)

  return [
    {
      id: 'requested',
      title: 'تم إنشاء الطلب',
      description: 'تم استلام طلب التسوية وإضافته إلى قائمة المراجعة.',
      date: settlement.requestedAt,
      color: 'info',
      done: true,
    },
    {
      id: 'processing',
      title: 'بدء المعالجة',
      description: 'بدأ الفريق المالي معالجة الطلب والتحقق من بياناته.',
      date: settlement.processingStartedAt,
      color: 'warning',
      done:
        settlement.status >= SettlementStatus.InProcess ||
        Boolean(settlement.processingStartedAt),
    },
    {
      id: 'completed',
      title:
        settlement.status === SettlementStatus.ClosedWithoutCompletion
          ? 'إغلاق الطلب'
          : 'إتمام التسوية',
      description:
        settlement.status === SettlementStatus.ClosedWithoutCompletion
          ? 'تم إغلاق الطلب بدون إكمال. راجع الملاحظات الإدارية لمعرفة السبب.'
          : 'تمت معالجة الطلب واحتساب صافي المبلغ النهائي.',
      date: settlement.completedAt,
      color: statusMeta.color,
      done:
        settlement.status >= SettlementStatus.Completed ||
        Boolean(settlement.completedAt),
    },
  ]
}

function getTimelineDotColor(step: TimelineStep): TimelineDotColor {
  if (!step.done) return 'grey'
  if (!step.color || step.color === 'default') return 'inherit'

  return step.color
}

type SettlementTimelineProps = {
  settlement: SettlementDetailsResponse
}

export default function SettlementTimeline({ settlement }: SettlementTimelineProps) {
  const statusMeta = getSettlementStatusMeta(settlement.status)
  const steps = buildTimelineSteps(settlement)

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        background:
          'linear-gradient(180deg, rgba(25,118,210,0.03) 0%, rgba(255,255,255,0.7) 100%)',
      }}
    >
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            المخطط الزمني للطلب
          </Typography>
          <Chip size="small" label={statusMeta.label} color={statusMeta.color} />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          تسلسل مراحل طلب التسوية من لحظة الإنشاء حتى آخر حالة مسجلة في النظام.
        </Typography>
      </Stack>

      <Timeline
        position="alternate"
        sx={{
          m: 0,
          p: 0,
          [`& .MuiTimelineItem-root:before`]: {
            flex: { xs: 0, md: 1 },
            px: 0,
          },
        }}
      >
        {steps.map((step, index) => (
          <TimelineItem key={step.id}>
            <TimelineOppositeContent
              color="text.secondary"
              sx={{ display: { xs: 'none', md: 'block' }, pt: 2.25 }}
            >
              {formatDate(step.date, 'بانتظار التنفيذ')}
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getTimelineDotColor(step)} variant={step.done ? 'filled' : 'outlined'} />
              {index < steps.length - 1 ? <TimelineConnector /> : null}
            </TimelineSeparator>

            <TimelineContent sx={{ py: 1.5, px: 2 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  borderColor: step.done ? `${step.color}.main` : 'divider',
                }}
              >
                <Stack spacing={0.75}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {step.title}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', md: 'none' } }}>
                      {formatDate(step.date, 'بانتظار التنفيذ')}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Stack>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  )
}