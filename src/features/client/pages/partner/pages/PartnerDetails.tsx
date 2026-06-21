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

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BadgeIcon from '@mui/icons-material/Badge'
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
import { getAccountStatusInfo } from '@/features/client/utils/account-status'

export default function PartnerDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(0)

  const partnerQuery = useClient(id)
  const details = partnerQuery.data

  const accountStatus = getAccountStatusInfo(details?.accountStatus)

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
              startIcon={<EditIcon />}
              onClick={() => navigate('edit')}
            >
              تعديل
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              العودة
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
                label="الهوية الوطنية"
                value={details.nationalId}
              />

              <DetailItem
                label="نوع الهوية"
                value={details.nationalIdTypeName}
              />
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
              <DetailItem
                label="الجهة"
                value={details.organizationName}
              />
            </InfoSection>
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
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

          <TabPanel value={activeTab} index={2}>
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
