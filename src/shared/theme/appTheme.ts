import { createTheme } from '@mui/material/styles'

export const rawashnColors = {
  primary: '#0B7A3E',
  primaryDark: '#07582C',
  primaryLight: '#42A56F',
  primarySoft: '#E7F5EC',
  accent: '#111111',
  accentSoft: '#2F2F2F',
  surface: '#FFFFFF',
  surfaceMuted: '#F5FAF7',
  surfaceGlass: 'rgba(255, 255, 255, 0.92)',
  border: 'rgba(17, 17, 17, 0.12)',
  borderStrong: 'rgba(17, 17, 17, 0.2)',
  textPrimary: '#111111',
  textSecondary: '#4B5563',
  iconOnBrand: '#F7FFF9',
  heroGlow: 'rgba(11, 122, 62, 0.14)',
  heroBackground: '#ECF7F0',
  shadow: '0 18px 40px rgba(17, 17, 17, 0.08)',
} as const

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: rawashnColors.primary,
      dark: rawashnColors.primaryDark,
      light: rawashnColors.primaryLight,
      contrastText: rawashnColors.surface,
    },
    secondary: {
      main: rawashnColors.accent,
      contrastText: rawashnColors.surface,
    },
    text: {
      primary: rawashnColors.textPrimary,
      secondary: rawashnColors.textSecondary,
    },
    background: {
      default: rawashnColors.surfaceMuted,
      paper: rawashnColors.surface,
    },
    divider: rawashnColors.border,
  },
  shape: {
    borderRadius: 5,
  },
  typography: {
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--rawashn-primary': rawashnColors.primary,
          '--rawashn-primary-dark': rawashnColors.primaryDark,
          '--rawashn-primary-light': rawashnColors.primaryLight,
          '--rawashn-primary-soft': rawashnColors.primarySoft,
          '--rawashn-accent': rawashnColors.accent,
          '--rawashn-accent-soft': rawashnColors.accentSoft,
          '--rawashn-surface': rawashnColors.surface,
          '--rawashn-surface-muted': rawashnColors.surfaceMuted,
          '--rawashn-surface-glass': rawashnColors.surfaceGlass,
          '--rawashn-border': rawashnColors.border,
          '--rawashn-border-strong': rawashnColors.borderStrong,
          '--rawashn-text-primary': rawashnColors.textPrimary,
          '--rawashn-text-secondary': rawashnColors.textSecondary,
          '--rawashn-icon-on-brand': rawashnColors.iconOnBrand,
          '--rawashn-hero-glow': rawashnColors.heroGlow,
          '--rawashn-hero-background': rawashnColors.heroBackground,
          '--rawashn-shadow': rawashnColors.shadow,
        },
        body: {
          backgroundColor: rawashnColors.surfaceMuted,
          color: rawashnColors.textPrimary,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: rawashnColors.surface,
          color: rawashnColors.textPrimary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderColor: rawashnColors.border,
          boxShadow: rawashnColors.shadow,
        },
      },
    },
  },
})

export default theme