import * as React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import MuiToolbar from '@mui/material/Toolbar';
import { tabsClasses } from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import { useNavigate } from 'react-router';
import MenuContent from '../ui/MenuContent';
import SideMenuMobile from '../ui/SideMenuMobile';
import MenuButton from '../ui/MenuButton';
import { useLogout } from '@/features/auth/hooks';

const Toolbar = styled(MuiToolbar)({
  width: '100%',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  justifyContent: 'center',
  gap: '12px',
  flexShrink: 0,
  [`& ${tabsClasses.list}`]: {
    gap: '8px',
    p: '8px',
    pb: 0,
  },
});

interface AppNavbarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AppNavbar({ collapsed, onToggleCollapse }: AppNavbarProps) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleLogout = () => {
    logout(undefined, {
      onSettled: () => {
        navigate('/login', { replace: true });
      },
    });
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'flex', md: 'none' },
          boxShadow: 0,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
          top: 'var(--template-frame-height, 0px)',
        }}
      >
        <Toolbar variant="regular">
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              flexGrow: 1,
              width: '100%',
              gap: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'center', mr: 'auto' }}
            >
              <CustomIcon />
              <Typography variant="h4" component="h1" sx={{ color: 'text.primary' }}>
                لوحة التحكم
              </Typography>
            </Stack>
            <MenuButton aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuRoundedIcon />
            </MenuButton>
            <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />
          </Stack>
        </Toolbar>
      </AppBar>

      <Paper
        elevation={0}
        square
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'fixed',
          top: 0,
          insetInlineStart: 0,
          bottom: 0,
          width: collapsed ? 96 : 280,
          p: 2,
          flexDirection: 'column',
          borderInlineEnd: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'var(--rawashn-surface-glass)',
          backdropFilter: 'blur(18px)',
          transition: 'width 200ms ease',
          overflow: 'hidden',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <CustomIcon />
            {!collapsed && (
              <Stack spacing={0}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  رواشن
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  لوحة تحكم الفندق
                </Typography>
              </Stack>
            )}
          </Stack>
          <MenuButton aria-label="toggle sidebar" onClick={onToggleCollapse}>
            {collapsed ? <ChevronLeftRoundedIcon /> : <ChevronRightRoundedIcon />}
          </MenuButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', px: collapsed ? 1.5 : 1, mb: 2 }}>
          <Avatar
            sizes="small"
            alt="رايلي كارتر"
            src="/static/images/avatar/7.jpg"
            sx={{ width: 40, height: 40  }}
          />
          {!collapsed && (
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                رايلي كارتر
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                مدير الاستقبال
              </Typography>
            </Stack>
          )}
          {!collapsed && (
            <MenuButton showBadge aria-label="Open notifications" sx={{ ml: 'auto' }}>
              <NotificationsRoundedIcon />
            </MenuButton>
          )}
        </Stack>

        <Stack sx={{ flexGrow: 1, minHeight: 0 }}>
          <MenuContent collapsed={collapsed} />
        </Stack>

        <Button
          variant={collapsed ? 'text' : 'outlined'}
          startIcon={collapsed ? undefined : <LogoutRoundedIcon />}
          sx={{ mt: 1, minWidth: 0 }}
          fullWidth={!collapsed}
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          {collapsed ? <LogoutRoundedIcon /> : 'تسجيل الخروج'}
        </Button>
      </Paper>
    </>
  );
}

export function CustomIcon() {
  return (
    <Box
      sx={(theme) => ({
        width: '1.5rem',
        height: '1.5rem',
        bgcolor: theme.palette.primary.dark,
        borderRadius: '999px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundImage:
          'linear-gradient(135deg, var(--rawashn-primary-light) 0%, var(--rawashn-primary-dark) 100%)',
        color: 'var(--rawashn-icon-on-brand)',
        border: '1px solid',
        borderColor: 'var(--rawashn-primary)',
        boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.24)',
      })}
    >
      <DashboardRoundedIcon color="inherit" sx={{ fontSize: '1rem' }} />
    </Box>
  );
}