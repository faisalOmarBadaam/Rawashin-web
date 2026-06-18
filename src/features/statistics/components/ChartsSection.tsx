import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import type { TrendPoint } from './TrendLineChart'
import type { CashFlowPoint } from './CashFlowAreaChart'
import type { DistributionPoint } from './DistributionDonutChart'
import CashFlowAreaChart from './CashFlowAreaChart'
import DistributionDonutChart from './DistributionDonutChart'
import TrendLineChart from './TrendLineChart'



interface ChartsSectionProps {
  trendLineData: TrendPoint[]
  cashFlowData: CashFlowPoint[]
  distributionData: DistributionPoint[]
  loading: boolean
  trendDays: number
}

export function ChartsSection({ 
  trendLineData, 
  cashFlowData,
  distributionData, 
  loading, 
  trendDays 
}: ChartsSectionProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* الرسم البياني الخطي لاتجاه الرصيد */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{fontWeight:700,mb:0.5}}>
            اتجاه الرصيد خلال آخر {trendDays} يوماً
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            خط اتجاه متدرج يوضح تحرك الرصيد المتاح عبر الزمن
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TrendLineChart data={trendLineData} loading={loading} />
        </CardContent>
      </Card>

      {/* قسم الرسوم البيانية المزدوجة أسفل الصفحة */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
          gap: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{fontWeight:700,mb:0.5}}>
              التدفقات النقدية (داخل / خارج)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              مقارنة حركة الداخل والخارج خلال نفس الفترة
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <CashFlowAreaChart data={cashFlowData} loading={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{fontWeight:700,mb:0.5}}>
              توزيع العمليات حسب نوع العميل
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              رؤية نسبية لعدد العمليات بين أنواع الحسابات
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <DistributionDonutChart data={distributionData} loading={loading}/>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}