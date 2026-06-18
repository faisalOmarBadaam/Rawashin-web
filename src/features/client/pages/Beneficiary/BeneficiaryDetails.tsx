import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import type { ChipProps } from '@mui/material/Chip'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import BadgeIcon from '@mui/icons-material/Badge'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import HistoryIcon from '@mui/icons-material/History'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'

import dayjs from 'dayjs'

import { DetailItem, InfoSection, TabPanel } from '../../components/ui'
import { useClient } from '../../hooks'

export default function BeneficiaryDetails() {
  const { id } = useParams() as { id?: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  const beneficiaryQuery = useClient(id)
  const details = beneficiaryQuery.data

  const accountStatus = useMemo<{
    label: string
    color: ChipProps['color']
  }>(() => {
    switch (details?.accountStatus) {
      case 0:
        return { label: 'غير نشط', color: 'default' }
      case 1:
        return { label: 'نشط', color: 'success' }
      case 2:
        return { label: 'قيد الانتظار', color: 'warning' }
      default:
        return { label: details?.accountStatus !== undefined ? String(details.accountStatus) : '—', color: 'default' }
    }
  }, [details?.accountStatus])

  const errorMessage = beneficiaryQuery.error instanceof Error ? beneficiaryQuery.error.message : 'خطأ في جلب البيانات'

  if (!id) return <Alert severity="error">المعرف غير موجود</Alert>

  if (beneficiaryQuery.isLoading)
    return (
      <Box sx={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )

  if (beneficiaryQuery.isError) return <Alert severity="error">{errorMessage}</Alert>

  if (!details) return <Alert severity="info">لا توجد بيانات لهذا المستفيد</Alert>

  const createdAt = details.createdAt ? dayjs(details.createdAt).format('YYYY/MM/DD HH:mm') : '—'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              <PersonIcon fontSize="large" />
            </Avatar>

            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{details.fullName ?? 'بدون اسم'}</Typography>
                <Chip size="small" label={accountStatus.label} color={accountStatus.color} />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                تاريخ الإنشاء: {createdAt}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>العودة</Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate('edit')}>تعديل</Button>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(_, value: number) => setActiveTab(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab icon={<BadgeIcon />} iconPosition="start" label="البيانات الأساسية" />
          <Tab icon={<ContactPhoneIcon />} iconPosition="start" label="التواصل" />
          <Tab icon={<AccountBalanceIcon />} iconPosition="start" label="الحساب والمنظمة" />
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="المعاملات" />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="السجل" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <TabPanel value={activeTab} index={0}>
            <InfoSection title="البيانات الأساسية" description="معلومات التعريف الرئيسية الخاصة بالمستفيد.">
              <DetailItem label="الاسم الكامل" value={details.fullName} />
              <DetailItem label="المعرف" value={details.id} />
              <DetailItem label="الهوية الوطنية" value={details.nationalId} />
              <DetailItem label="نوع الهوية" value={details.nationalIdTypeName} />
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <InfoSection title="بيانات التواصل" description="بيانات الاتصال والعنوان المسجلة للمستفيد.">
              <DetailItem label="رقم الهاتف" value={details.phoneNumber} />
              <DetailItem label="المدينة" value={details.city} />
              <DetailItem label="العنوان" value={details.address} />
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <InfoSection title="الحساب والمنظمة" description="حالة الحساب والبيانات المرتبطة بالمنظمة والبطاقة.">
              <DetailItem label="حالة الحساب" value={<Chip size="small" label={accountStatus.label} color={accountStatus.color} />} />
              <DetailItem label="الجهة" value={details.parentClientName} />
              <DetailItem label="استلم البطاقة" value={details.isReceivedCard ? 'نعم' : 'لا'} />
            </InfoSection>
          </TabPanel>
 <TabPanel value={activeTab} index={3}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  المعاملات
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  لا توجد معاملات متاحة حاليًا لهذا المستفيد.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  السجل
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  لا توجد بيانات سجل متاحة حاليًا لهذا المستفيد.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

         
        </Box>
      </Paper>
    </Box>
  )
}