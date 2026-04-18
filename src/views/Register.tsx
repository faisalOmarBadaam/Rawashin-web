'use client'

// React Imports
import { useState } from 'react'


// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import { toast } from 'react-toastify'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { getErrorMessage } from '@/libs/api/getErrorMessage'

// Schema Imports
import { registerSchema, type RegisterSchema } from '@/schemas/auth'

// API Imports
import { AuthApi } from '@/libs/api/modules/auth.api'
import { tokenStore } from '@/libs/api/tokenStore'
import { useAuthStore } from '@/contexts/auth/auth.store'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

const Register = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  const darkImg = '/images/pages/auth-v1-mask-3-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-3-light.png'
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      phoneNumber: '',
      password: '',
      firstName: '',
      secondName: '',
      thirdName: '',
      lastName: '',
      nationalId: '',
      address: '',
      profilePictureUrl: '',
      clientType: 0,
      city: ''
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async (data: RegisterSchema) => {
    try {
      setLoading(true)

      const res = await AuthApi.register({
        ...data,
        email: data.email ? data.email : undefined
      })

      tokenStore.setTokens({
        accessToken: res.accessToken!,
        refreshToken: res.refreshToken!
      })
      tokenStore.setIsFirstLogin(res.isFirstLogin)

      const payload = tokenStore.getPayload()

      if (payload) {
        useAuthStore.getState().login({
          userId: payload.id || payload.sub || '',
          email: payload.email,
          name: payload.name,
          roles: payload.roles || [],
          accessToken: res.accessToken!,
          refreshToken: res.refreshToken!,
          expiresIn: payload.exp ?? 0
        })
      }

      toast.success('تم إنشاء الحساب وتسجيل الدخول بنجاح')
      router.replace(getLocalizedUrl(themeConfig.homePageUrl, locale as Locale))
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'فشل إنشاء الحساب'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex justify-center items-center min-bs-dvh is-full relative p-6'>
      <Card className='flex flex-col sm:is-[600px]'>
        <CardContent className='p-6 sm:p-12!'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>

          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>اضافة العملاء 🚀</Typography>
              <Typography className='mbs-1'>أنشئ حسابك الجديد بسهولة</Typography>
            </div>

            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
              <Grid container spacing={5}>
                {/* Personal Info */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='firstName'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='الاسم الأول'
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='lastName'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='اسم العائلة'
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='secondName'
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label='الاسم الثاني (اختياري)' />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='thirdName'
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label='الاسم الثالث (اختياري)' />
                    )}
                  />
                </Grid>

                {/* Account Info */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name='email'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='البريد الإلكتروني'
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='كلمة المرور'
                        type={isPasswordShown ? 'text' : 'password'}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  size='small'
                                  edge='end'
                                  onClick={handleClickShowPassword}
                                  onMouseDown={e => e.preventDefault()}
                                >
                                  <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                                </IconButton>
                              </InputAdornment>
                            )
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Contact Info */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='phoneNumber'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='رقم الهاتف'
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='nationalId'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='رقم الهوية'
                        error={!!errors.nationalId}
                        helperText={errors.nationalId?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='city'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='المدينة'
                        error={!!errors.city}
                        helperText={errors.city?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='address'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='العنوان'
                        error={!!errors.address}
                        helperText={errors.address?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? <CircularProgress size={22} color='inherit' /> : 'تسجيل'}
              </Button>

              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>لديك حساب بالفعل؟</Typography>
                <Link href={getLocalizedUrl('/login', locale as Locale)}>
                  <Typography color='primary'>تسجيل الدخول</Typography>
                </Link>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      <img src={authBackground} className='absolute bottom-[5%] z-[-1] is-full max-md:hidden' />
    </div>
  )
}

export default Register
