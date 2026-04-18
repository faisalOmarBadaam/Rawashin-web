'use client'

import type { MouseEvent } from 'react'
import { useMemo, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

import { useSettings } from '@core/hooks/useSettings'

import AdminResetPasswordDialog from '@/components/dialogs/AdminResetPasswordDialog'
import { useAuthStore } from '@/contexts/auth/auth.store'
import { secureLogout } from '@/core/auth/secureLogout'
import { AuthApi } from '@/libs/api/modules/auth.api'

const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)',
})

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)

  const router = useRouter()
  const { lang } = useParams()

  const { settings } = useSettings()
  const session = useAuthStore(s => s.session)
  const clientId = session?.userId
  const clientName = session?.name
  const firstName = useMemo(() => {
    if (!session?.name) return null
    return session.name.trim().split(' ')[0]
  }, [session?.name])

  const handleDropdownOpen = () => {
    setOpen(prev => !prev)
  }

  const handleDropdownClose = (event?: MouseEvent | TouchEvent, url?: string) => {
    if (url) router.push(url)

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      await AuthApi.logout()
    } catch {
      // Ignore backend logout failures and continue local logout.
    } finally {
      secureLogout()
      router.replace(`/${lang}/login`)
    }
  }

  return (
    <>
      <div className="flex items-center">
        <Typography
          variant="body2"
          className="me-2 hidden md:block whitespace-nowrap font-medium text-textPrimary"
        >
          👋 مرحباً {firstName ?? 'بك'}
        </Typography>

        <Badge
          ref={anchorRef}
          overlap="circular"
          badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          className="mis-2"
        >
          <Avatar
            alt={session?.name ?? session?.email ?? 'User'}
            src="/images/avatars/1.png"
            onClick={handleDropdownOpen}
            className="cursor-pointer bs-[38px] is-[38px]"
          />
        </Badge>
      </div>

      <Popper
        open={open}
        transition
        disablePortal
        placement="bottom-end"
        anchorEl={anchorRef.current}
        className="min-is-[240px] !mbs-4 z-[1]"
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top',
            }}
          >
            <Paper
              elevation={settings.skin === 'bordered' ? 0 : 8}
              {...(settings.skin === 'bordered' && { className: 'border' })}
            >
              <ClickAwayListener
                onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}
              >
                <MenuList>
                  <div className="flex items-center plb-2 pli-4 gap-2" tabIndex={-1}>
                    <Avatar
                      alt={session?.name ?? session?.email ?? 'User'}
                      src="/images/avatars/1.png"
                    />
                    <div className="flex items-start flex-col">
                      <Typography variant="body2" className="font-medium" color="text.primary">
                        {session?.name ?? session?.email ?? '—'}
                      </Typography>

                      {/* <Typography variant='caption' color='text.secondary'>
                        {session?.email ?? ''}
                      </Typography> */}

                      <Typography variant="caption">
                        {Array.isArray(session?.roles) ? session?.roles.join(', ') : ''}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-center plb-1.5 pli-4">
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<i className="ri-lock-password-line" />}
                      onClick={() => {
                        setResetPasswordOpen(true)
                        setOpen(false)
                      }}
                    >
                      تغيير كلمة المرور
                    </Button>
                  </div>
                  <Divider className="mlb-1" />

                  <div className="flex items-center plb-1.5 pli-4">
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size="small"
                      endIcon={<i className="ri-logout-box-r-line" />}
                      onClick={handleUserLogout}
                    >
                      تسجيل الخروج
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      {clientId && clientName && (
        <AdminResetPasswordDialog
          open={resetPasswordOpen}
          onClose={() => setResetPasswordOpen(false)}
          clientId={clientId}
          clientName={clientName}
        />
      )}
    </>
  )
}

export default UserDropdown
