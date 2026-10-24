import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Stack,
  Container,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAppSelector } from '../../../Store/hooks.js';
import { selectCurrentUser, selectIsAuthenticated } from '../../../Store/Slice/authSlice.js';

export default function HeroSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const isDark = theme.palette.mode === 'dark';

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const ArrowIcon = isRtl ? ArrowBackIcon : ArrowForwardIcon;

  const scrollTo = (targetId) => {
    const el = document.querySelector(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const featurePills = [
    { label: 'Real-Time Socket.IO', icon: <BoltIcon sx={{ fontSize: 16 }} /> },
    { label: 'Time Tracking & Logs', icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
    { label: 'Agile Kanban Boards', icon: <ViewKanbanOutlinedIcon sx={{ fontSize: 16 }} /> },
    { label: 'Bilingual RTL & LTR', icon: <TranslateIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        pt: { xs: 8, md: 12 },
        pb: { xs: 6, md: 10 },
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glows */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: 340, md: 720 },
          height: { xs: 300, md: 450 },
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, rgba(36, 59, 107, 0.06) 50%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          {/* Top Announcement Pill */}
          <Chip
            label={t('landing.hero.badge')}
            icon={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#10B981',
                  boxShadow: '0 0 10px #10B981',
                }}
              />
            }
            sx={{
              py: 2,
              px: 1.5,
              fontWeight: 700,
              fontSize: '0.8125rem',
              bgcolor: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(36, 59, 107, 0.06)',
              color: 'primary.main',
              border: '1px solid',
              borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(36, 59, 107, 0.15)',
              borderRadius: '999px',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.02)' },
            }}
          />

          {/* Main Headline */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.2rem', sm: '3.2rem', md: '4rem' },
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              maxWidth: 960,
              color: 'text.primary',
            }}
          >
            {t('landing.hero.title')}
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
              color: 'text.secondary',
              maxWidth: 780,
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            {t('landing.hero.subtitle')}
          </Typography>

          {/* Action CTAs */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}
          >
            {isAuthenticated ? (
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                size="large"
                startIcon={
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: '0.75rem',
                      bgcolor: 'primary.dark',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                }
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
                {t('landing.hero.goToDashboard')}
              </Button>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowIcon />}
                  sx={{
                    px: 3.5,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    width: { xs: '100%', sm: 'auto' },
                    boxShadow: '0 8px 24px rgba(36, 59, 107, 0.35)',
                  }}
                >
                  {t('landing.nav.signIn')}
                </Button>
                <Button
                  onClick={() => scrollTo('#tour')}
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrowOutlinedIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  {t('landing.hero.exploreFeatures')}
                </Button>
              </>
            )}
          </Stack>

          {/* Feature Badge Pills */}
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="center"
            flexWrap="wrap"
            sx={{
              gap: 1.25,
              pt: { xs: 2, md: 3 },
            }}
          >
            {featurePills.map((pill) => (
              <Box
                key={pill.label}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.85,
                  borderRadius: 2.5,
                  bgcolor: (th) =>
                    th.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'text.primary',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', display: 'flex' }}>{pill.icon}</Box>
                <span>{pill.label}</span>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
