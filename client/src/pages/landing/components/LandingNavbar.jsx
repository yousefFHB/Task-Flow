import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAppSelector } from '../../../Store/hooks.js';
import { selectCurrentUser, selectIsAuthenticated } from '../../../Store/Slice/authSlice.js';
import ThemeToggle from '../../../components/common/ThemeToggle.jsx';
import LanguageSwitcher from '../../../components/common/LanguageSwitcher.jsx';
import logoImage from '../../../assets/logo.png';

export default function LandingNavbar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const ArrowIcon = isRtl ? ArrowBackIcon : ArrowForwardIcon;

  const navLinks = [
    { label: t('landing.nav.features'), href: '#features' },
    { label: t('landing.nav.tour'), href: '#tour' },
    { label: t('landing.nav.modules'), href: '#features' },
  ];

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    setMobileOpen(false);
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: 1100,
        bgcolor: (th) =>
          th.palette.mode === 'dark'
            ? 'rgba(11, 15, 25, 0.82)'
            : 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            justifyContent: 'space-between',
            height: { xs: 64, md: 72 },
          }}
        >
          {/* Brand Logo & Name */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            component={RouterLink}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Box
              component="img"
              src={logoImage}
              alt={t('common.appName')}
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                objectFit: 'contain',
                p: 0.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                }}
              >
                {t('common.appName')}
              </Typography>
              <Chip
                label="PRO"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: (th) =>
                    th.palette.mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(36, 59, 107, 0.1)',
                  color: 'primary.main',
                  borderRadius: '6px',
                }}
              />
            </Stack>
          </Stack>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    borderRadius: 2,
                    px: 1.75,
                    py: 0.75,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
          )}

          {/* Right Action Section: Theme, Lang, Sign-In/Dashboard */}
          <Stack direction="row" spacing={1.25} alignItems="center">
            <ThemeToggle size="small" />
            <LanguageSwitcher size="small" variant="text" />

            {isAuthenticated ? (
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                size="small"
                startIcon={
                  <Avatar
                    sx={{
                      width: 22,
                      height: 22,
                      fontSize: '0.7rem',
                      bgcolor: 'primary.dark',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                }
                endIcon={<ArrowIcon fontSize="small" />}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 2,
                  py: 0.8,
                  boxShadow: '0 4px 14px rgba(36, 59, 107, 0.25)',
                }}
              >
                {t('landing.nav.dashboard')}
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="small"
                  startIcon={<LoginOutlinedIcon fontSize="small" />}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 1.75,
                    py: 0.75,
                  }}
                >
                  {t('landing.nav.signIn')}
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    py: 0.75,
                    boxShadow: '0 4px 14px rgba(36, 59, 107, 0.25)',
                  }}
                >
                  {t('landing.nav.getStarted')}
                </Button>
              </Stack>
            )}

            {/* Mobile Hamburger Button */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="open navigation drawer"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 0.8,
                }}
              >
                {mobileOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor={isRtl ? 'right' : 'left'}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            p: 2.5,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box
                component="img"
                src={logoImage}
                alt={t('common.appName')}
                sx={{ width: 32, height: 32, borderRadius: 1.5 }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {t('common.appName')}
              </Typography>
            </Stack>
            <IconButton onClick={() => setMobileOpen(false)} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <List sx={{ py: 1 }}>
            {navLinks.map((link) => (
              <ListItem key={link.href} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={(e) => handleScrollTo(e, link.href)}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {isAuthenticated ? (
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                fullWidth
                startIcon={<DashboardOutlinedIcon />}
              >
                {t('landing.nav.dashboard')}
              </Button>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  fullWidth
                  startIcon={<LoginOutlinedIcon />}
                >
                  {t('landing.nav.signIn')}
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  fullWidth
                >
                  {t('landing.nav.getStarted')}
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Drawer>
    </AppBar>
  );
}
