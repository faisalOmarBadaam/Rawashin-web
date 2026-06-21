import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import dayjs from 'dayjs'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

import type { ChipProps } from '@mui/material/Chip'

import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BadgeIcon from '@mui/icons-material/Badge'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'
import EditIcon from '@mui/icons-material/Edit'
import GroupIcon from '@mui/icons-material/Group'
import HistoryIcon from '@mui/icons-material/History'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'


import ClientTransactionsTable from '@/features/client/components/ClientTransactionsTable'
import {
  DetailItem,
  InfoSection,
  TabPanel,
} from '@/features/client/components/ui'
import { useClient } from '@/features/client/hooks'
import PageDetailsHeader from '@/features/client/components/PageDetailsHeader'

type AccountStatusInfo = {
  label: string
  color: ChipProps['color']
}

function getAccountStatus(
  status: number | null | undefined,
): AccountStatusInfo {
  switch (status) {
    case 0:
      return {
        label: 'غير نشط',
        color: 'default',
      }

    case 1:
      return {
        label: 'نشط',
        color: 'success',
      }

    case 2:
      return {
        label: 'قيد الانتظار',
        color: 'warning',
      }

    default:
      return {
        label: status != null ? String(status) : '—',
        color: 'default',
      }
  }
}

export default function PartnerDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(0)

  const partnerQuery = useClient(id)
  const details = partnerQuery.data

  const accountStatus = getAccountStatus(details?.accountStatus)

  const errorMessage =
    partnerQuery.error instanceof Error
      ? partnerQuery.error.message
      : 'خطأ في جلب البيانات'

  if (!id) {
    return <Alert severity="error">المعرف غير موجود</Alert>
  }

  if (partnerQuery.isLoading) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (partnerQuery.isError) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if (!details) {
    return <Alert severity="info">لا توجد بيانات لهذا الشريك</Alert>
  }

  const createdAt = details.createdAt
    ? dayjs(details.createdAt).format('YYYY/MM/DD HH:mm')
    : '—'

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <PageDetailsHeader
        title={details.fullName ?? 'بدون اسم'}
        subtitle={`تاريخ الإنشاء: ${createdAt}`}
        avatar={<PersonIcon fontSize="large" />}
        status={
          <Chip
            size="small"
            label={accountStatus.label}
            color={accountStatus.color}
          />
        }
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              العودة
            </Button>

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate('edit')}
            >
              تعديل
            </Button>
          </>
        }
      />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value: number) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tab
            icon={<BadgeIcon />}
            iconPosition="start"
            label="البيانات الأساسية"
          />

          <Tab
            icon={<ContactPhoneIcon />}
            iconPosition="start"
            label="التواصل"
          />

          <Tab
            icon={<AccountBalanceIcon />}
            iconPosition="start"
            label="الحساب والمنظمة"
          />

          <Tab
            icon={<GroupIcon />}
            iconPosition="start"
            label="التابعين"
          />

          <Tab
            icon={<ReceiptLongIcon />}
            iconPosition="start"
            label="المعاملات"
          />

          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label="السجل"
          />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <TabPanel value={activeTab} index={0}>
            <InfoSection
              title="البيانات الأساسية"
              description="معلومات التعريف الرئيسية الخاصة بالشريك."
            >
              <DetailItem
                label="الاسم الكامل"
                value={details.fullName}
              />

              <DetailItem
                label="المعرف"
                value={details.id}
              />

              <DetailItem
                label="الهوية الوطنية"
                value={details.nationalId}
              />

              <DetailItem
                label="نوع الهوية"
                value={details.nationalIdTypeName}
              />
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <InfoSection
              title="بيانات التواصل"
              description="بيانات الاتصال والعنوان المسجلة للشريك."
            >
              <DetailItem
                label="رقم الهاتف"
                value={details.phoneNumber}
              />

              <DetailItem
                label="المدينة"
                value={details.city}
              />

              <DetailItem
                label="العنوان"
                value={details.address}
              />
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <InfoSection
              title="الحساب والمنظمة"
              description="حالة الحساب والبيانات المرتبطة بالمنظمة والبطاقة."
            >
              <DetailItem
                label="حالة الحساب"
                value={
                  <Chip
                    size="small"
                    label={accountStatus.label}
                    color={accountStatus.color}
                  />
                }
              />

              <DetailItem
                label="الجهة"
                value={details.organizationName}
              />

              <DetailItem
                label="استلم البطاقة"
                value={details.isReceivedCard ? 'نعم' : 'لا'}
              />
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  التابعون
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                  }}
                >
                  لا توجد بيانات متاحة حاليًا للتابعين.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <ClientTransactionsTable
              clientId={details.id}
              title="معاملات الشريك"
              description="عرض معاملات الشريك مع فلترة حسب نوع العملية والتاريخ."
            />
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  السجل
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                  }}
                >
                  لا توجد بيانات سجل متاحة حاليًا لهذا الشريك.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  )
}
