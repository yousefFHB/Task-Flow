import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Container,
  Stack,
  Divider,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import ThemeToggle from '../../../components/common/ThemeToggle.jsx';
import LanguageSwitcher from '../../../components/common/LanguageSwitcher.jsx';
import logoImage from '../../../assets/logo.png';

export default function LandingFooter() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const scrollTo = (targetId) => {
    const el = document.querySelector(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box
      component="footer"
      sx={{
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 6 },
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: isDark ? '#080C14' : '#F1F5F9',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={3}
          >
            {/* Brand column */}
            <Stack spacing={1.5} sx={{ maxWidth: 380 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  component="img"
                  src={logoImage}
                  alt={t('common.appName')}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    p: 0.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {t('common.appName')}
                </Typography>
                <Chip
                  label="PRO"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    bgcolor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(36, 59, 107, 0.1)',
                    color: 'primary.main',
                  }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {t('landing.footer.description')}
              </Typography>
            </Stack>

            {/* Quick Links */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button onClick={() => scrollTo('#features')} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('landing.nav.features')}
              </Button>
              <Button onClick={() => scrollTo('#tour')} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('landing.nav.tour')}
              </Button>
              <Button component={RouterLink} to="/login" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('landing.nav.signIn')}
              </Button>
              <Button component={RouterLink} to="/register" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('auth.createAccount')}
              </Button>
            </Stack>

            {/* System Status & Toggles */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: '#10B981' }} />}
                label={t('landing.footer.status')}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)',
                }}
              />
              <ThemeToggle size="small" />
              <LanguageSwitcher size="small" variant="text" />
            </Stack>
          </Stack>

          <Divider />

          {/* Copyright */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('common.copyright', { year: new Date().getFullYear() })}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {t('common.saasSubtitle')}
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
