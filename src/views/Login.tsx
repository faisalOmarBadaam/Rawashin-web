'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { toast } from 'react-toastify'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import CircularProgress from '@mui/material/CircularProgress'

import { getErrorMessage } from '@/libs/api/getErrorMessage'

import { loginSchema, type LoginSchema } from '@/schemas/auth'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// API Imports
import { useAuthStore } from '@/contexts/auth/auth.store'
import { secureLogout } from '@/core/auth/secureLogout'
import { AuthApi } from '@/libs/api/modules/auth.api'
import { tokenStore } from '@/libs/api/tokenStore'

const LoginV1 = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)

  const darkImg = '/images/pages/auth-v1-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-1-light.png'
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  // ===============================
  // Form
  // ===============================
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhoneNumber: '',
      password: '',
    },
  })

  // ===============================
  // Handlers
  // ===============================
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async (data: LoginSchema) => {
    try {
      setLoading(true)

      const res = await AuthApi.login({
        emailOrPhoneNumber: data.emailOrPhoneNumber,
        password: data.password,
      })

      tokenStore.setTokens({
        accessToken: res.accessToken!,
        refreshToken: res.refreshToken!,
      })
      tokenStore.setIsFirstLogin(res.isFirstLogin)

      const payload = tokenStore.getPayload()

      if (!payload || !payload.id) {
        secureLogout()
        throw new Error('Invalid token payload')
      }
      const BLOCKED_ROLES = ['Customer', 'Partner']

      const hasBlockedRole = payload.roles?.some(role => BLOCKED_ROLES.includes(role))

      if (hasBlockedRole) {
        secureLogout()
        toast.error('هذا الحساب غير مصرح له بالدخول')
        setLoading(false)
        return
      }
      useAuthStore.getState().login({
        userId: payload.id,
        email: payload.email ?? '',
        name: payload.name ?? payload.email ?? '',
        roles: payload.roles ?? [],
        expiresIn: payload.exp ?? 0,
      })

      toast.success('تم تسجيل الدخول بنجاح')
      router.replace(getLocalizedUrl(themeConfig.homePageUrl, locale as Locale))
    } catch (err: any) {
      setLoading(false)
      toast.error(getErrorMessage(err, 'فشل تسجيل الدخول'))
    }
  }

  // ===============================
  // Render
  // ===============================
  return (
    <div className="flex justify-center items-center min-bs-dvh is-full relative p-6">
      <Card className="flex flex-col sm:is-[460px]">
        <CardContent className="p-6 sm:p-12!">
          <Link
            href={getLocalizedUrl('/', locale as Locale)}
            className="flex justify-center items-center mbe-6"
          >
            <Logo />
          </Link>

          <div className="flex flex-col gap-5">
            <div>
              <Typography variant="h4">{`مرحباً بك في ${themeConfig.templateName}! 👋`}</Typography>
              <Typography className="mbs-1">يرجى تسجيل الدخول إلى حسابك</Typography>
            </div>

            <form
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <Controller
                name="emailOrPhoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    autoFocus
                    fullWidth
                    label="البريد الإلكتروني أو رقم الهاتف"
                    error={!!errors.emailOrPhoneNumber}
                    helperText={errors.emailOrPhoneNumber?.message}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="كلمة المرور"
                    type={isPasswordShown ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              edge="end"
                              onClick={handleClickShowPassword}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />

              <div className="flex justify-between items-center flex-wrap">
                <FormControlLabel control={<Checkbox />} label="تذكرني" />
              </div>

              <Button fullWidth variant="contained" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={22} color="inherit" /> : 'تسجيل الدخول'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <img src={authBackground} className="absolute bottom-[5%] z-[-1] is-full max-md:hidden" />
    </div>
  )
}

export default LoginV1
