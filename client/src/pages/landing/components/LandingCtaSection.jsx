import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Container,
  Card,
  Button,
  Stack,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

import { useAppDispatch, useAppSelector } from '../../../Store/hooks.js';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  logout,
} from '../../../Store/Slice/authSlice.js';

export default function LandingCtaSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isRtl = theme.direction === 'rtl';
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const ArrowIcon = isRtl ? ArrowBackIcon : ArrowForwardIcon;

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
      }}
    >
      <Container maxWidth="md">
        <Card
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            borderRadius: 4,
            border: '1px solid',
            borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(36, 59, 107, 0.2)',
            background: isDark
              ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 27, 75, 0.6) 100%)'
              : 'linear-gradient(135deg, #FFFFFF 0%, #F0F4FF 100%)',
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)'
              : '0 25px 50px -12px rgba(36, 59, 107, 0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Background Ring */}
          <Box
            sx={{
              position: 'absolute',
              top: '-30%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 500,
              height: 300,
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          <Stack spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            {isAuthenticated ? (
              <>
                <Chip
                  icon={<CheckCircleOutlineIcon sx={{ fontSize: '16px !important' }} />}
                  label={isRtl ? 'نشست کاربری فعال' : 'Active Workspace Session'}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />

                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    bgcolor: 'primary.main',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>

                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
                    {t('landing.hero.signedInAs', { name: user?.name || (isRtl ? 'کاربر' : 'User') })}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {t('landing.signInSection.activeSessionSubtitle')}
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1, width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    component={RouterLink}
                    to="/"
                    variant="contained"
                    size="large"
                    startIcon={<DashboardOutlinedIcon />}
                    endIcon={<ArrowIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      borderRadius: 3,
                      boxShadow: '0 8px 24px rgba(36, 59, 107, 0.35)',
                    }}
                  >
                    {t('landing.hero.goToDashboard')}
                  </Button>
                  <Button
                    onClick={() => dispatch(logout())}
                    variant="outlined"
                    color="error"
                    size="large"
                    startIcon={<LogoutOutlinedIcon />}
                    sx={{ px: 3, py: 1.5, fontWeight: 600, borderRadius: 3 }}
                  >
                    {t('nav.signOut')}
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Chip
                  label={t('common.appName')}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                />

                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3rem' },
                    fontWeight: 800,
                    color: 'text.primary',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {isRtl ? 'آماده ورود به فضای کاری خود هستید؟' : 'Ready to Access Your Workspace?'}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    maxWidth: 580,
                    lineHeight: 1.6,
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                  }}
                >
                  {isRtl
                    ? 'از طریق صفحه ورود سامانه با شماره موبایل و رمز عبور خود وارد شوید و مدیریت پروژه‌ها را آغاز کنید.'
                    : 'Sign in through our secure portal to access active sprints, Kanban boards, and real-time team notifications.'}
                </Typography>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ pt: 1.5, width: { xs: '100%', sm: 'auto' } }}
                >
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    size="large"
                    startIcon={<LoginOutlinedIcon />}
                    endIcon={<ArrowIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      boxShadow: '0 8px 24px rgba(36, 59, 107, 0.35)',
                    }}
                  >
                    {t('landing.nav.signIn')}
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 3.5,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                    }}
                  >
                    {t('auth.createAccount')}
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
