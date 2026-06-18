import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import { useLogin } from '../hooks'
import { loginSchema } from '../schema'


const Login = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { mutateAsync: login, isPending } = useLogin()

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsed = loginSchema.safeParse({ phoneNumber, password })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'بيانات تسجيل الدخول غير صحيحة')
      return
    }

    await login(parsed.data, {
      onSuccess: () => {
        navigate('/', { replace: true })
      },
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        padding: 3,
        backgroundColor: 'background.default',
      }}
    >
      <Card 
        sx={{ 
          width: '100%', 
          maxWidth: 460, 
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        <CardContent sx={{ padding: { xs: 3, sm: 6 } }}>

          {/* نصوص الترحيب والنموذج */}
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                يرجى تسجيل الدخول إلى حسابك للبدء
              </Typography>
            </Box>

            <Box 
              component="form" 
              noValidate 
              autoComplete="off" 
              onSubmit={handleSubmit}
            >
              <Stack spacing={2.5}>
                
                <TextField
                  autoFocus
                  fullWidth
                  label="رقم الهاتف"
                  variant="outlined"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  disabled={isPending}
                />

                <TextField
                  fullWidth
                  label="كلمة المرور"
                  type={isPasswordShown ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isPending}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            edge="end"
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            sx={{ color: '#000000' }}
                          >
                            {isPasswordShown ? (
                              <VisibilityOff sx={{ color: '#000000' }} />
                            ) : (
                              <Visibility sx={{ color: '#000000' }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <FormControlLabel 
                    control={<Checkbox color="primary" />} 
                    label={<Typography variant="body2">تذكرني</Typography>} 
                  />
                </Box>

                <Button 
                  fullWidth 
                  variant="contained" 
                  type="submit" 
                  size="large"
                  disabled={isPending}
                  sx={{ py: 1.2, fontWeight: 'bold' }}
                >
                  {isPending ? <CircularProgress size={24} color="inherit" /> : 'تسجيل الدخول'}
                </Button>

              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      
    </Box>
  )
}

export default Login
