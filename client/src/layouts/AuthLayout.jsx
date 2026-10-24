import { Outlet, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Card, Typography, Container, Stack, Button } from '@mui/material';

import LanguageSwitcher from '../components/common/LanguageSwitcher.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import logoImage from '../assets/logo.png';

export default function AuthLayout() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        py: { xs: 4, sm: 6 },
        px: 2,
        position: 'relative',
      }}
    >
      {/* Top Bar with Theme Toggle and Language Switcher */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          insetInlineEnd: { xs: 16, sm: 28 },
          zIndex: 10,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            component={RouterLink}
            to="/landing"
            size="small"
            variant="text"
            sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary' }}
          >
            {t('landing.nav.features')}
          </Button>
          <ThemeToggle size="small" />
          <LanguageSwitcher size="small" variant="outlined" />
        </Stack>
      </Box>

      <Container maxWidth="xs">
        {/* Brand Header */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="center"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: 'none',
            mb: 3.5,
          }}
        >
          <Box
            component="img"
            src={logoImage}
            alt={t('common.saasTitle')}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              objectFit: 'contain',
              bgcolor: 'background.paper',
              p: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {t('common.saasTitle')}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mt: 0.25 }}
            >
              {t('common.saasSubtitle')}
            </Typography>
          </Box>
        </Stack>

        {/* Main Card */}
        <Card
          sx={{
            p: { xs: 3, sm: 4.5 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
            bgcolor: 'background.paper',
            '&:last-child': { pb: { xs: 3, sm: 4.5 } },
          }}
        >
          <Outlet />
        </Card>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('common.copyright', { year: new Date().getFullYear() })}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
