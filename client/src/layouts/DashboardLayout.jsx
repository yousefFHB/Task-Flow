import { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack,
  Badge,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import AddIcon from '@mui/icons-material/Add';

import { useAppDispatch, useAppSelector } from '../Store/hooks.js';
import { selectCurrentUser, logout, updateUserData } from '../Store/Slice/authSlice.js';
import { useGetUnreadCountQuery } from '../Store/servises/notificationApi/index.js';
import { useUpdateProfileMutation } from '../Store/servises/userApi.js';
import useSocketNotifications from '../utils/useSocketNotifications.js';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import logoImage from '../assets/logo.png';

const DRAWER_WIDTH = 260;

export default function DashboardLayout({ children }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [updateProfile] = useUpdateProfileMutation();

  const currentLang = i18n.language || 'en';

  const handleLanguageSelect = async (newLang) => {
    if (newLang === currentLang) return;
    await i18n.changeLanguage(newLang);
    localStorage.setItem('preferredLocale', newLang);
    if (user) {
      dispatch(updateUserData({ preferredLocale: newLang }));
      try {
        await updateProfile({ preferredLocale: newLang }).unwrap();
      } catch {
        // Silently preserve local preference even if network fails
      }
    }
  };

  // Listen to real-time events via Socket.IO
  useSocketNotifications();

  // Query unread notification count
  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = typeof unreadData?.data === 'number' ? unreadData.data : (typeof unreadData === 'number' ? unreadData : 0);

  const activeNavItems = [
    { label: t('nav.overview'), path: '/', icon: DashboardOutlinedIcon },
    { label: t('nav.tasks'), path: '/tasks', icon: AssignmentOutlinedIcon },
    { label: t('nav.projects'), path: '/projects', icon: FolderOutlinedIcon },
    { label: t('nav.teams'), path: '/teams', icon: GroupsOutlinedIcon },
    { label: t('nav.notifications'), path: '/notifications', icon: NotificationsNoneOutlinedIcon },
    { label: t('nav.userDirectory'), path: '/users', icon: PeopleAltOutlinedIcon },
    { label: t('nav.companyInfo'), path: '/company', icon: BusinessOutlinedIcon },
    { label: t('nav.myProfile'), path: '/profile', icon: PersonOutlineOutlinedIcon },
  ];

  const pendingNavItems = [
    { label: t('nav.sprints'), path: '/sprints', icon: TimelineOutlinedIcon },
  ];

  const allItems = [...activeNavItems, ...pendingNavItems];
  const currentItem = allItems.find((item) => item.path === location.pathname) || {
    label: t('common.taskWorkspace'),
    icon: DashboardOutlinedIcon,
  };
  const CurrentIcon = currentItem.icon;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          component="img"
          src={logoImage}
          alt={t('common.appName')}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            objectFit: 'contain',
            bgcolor: 'background.paper',
            p: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t('common.appName')}
            </Typography>
            <Chip
              label="PRO"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.625rem',
                fontWeight: 700,
                bgcolor: (th) =>
                  th.palette.mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(36, 59, 107, 0.1)',
                color: 'primary.main',
                borderRadius: '4px',
                px: 0.2,
              }}
            />
          </Stack>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mt: 0.25,
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t('common.appSubtitle')}
          </Typography>
        </Box>
      </Box>

      {/* Verified Workspace Navigation */}
      <Box sx={{ px: 2, pt: 2, pb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'text.disabled',
            fontSize: '0.6875rem',
            display: 'block',
          }}
        >
          {t('nav.activeWorkspace')}
        </Typography>
      </Box>

      <List sx={{ px: 1.25, py: 0 }}>
        {activeNavItems.map((item) => {
          const Icon = item.icon;
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                selected={isSelected}
                sx={{
                  borderRadius: '10px',
                  py: 1,
                  px: 1.5,
                  position: 'relative',
                  transition: 'all 0.15s ease-in-out',
                  ...(isSelected
                    ? {
                        bgcolor: (th) =>
                          th.palette.mode === 'dark'
                            ? 'rgba(99, 102, 241, 0.15)'
                            : 'rgba(36, 59, 107, 0.08)',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: (th) =>
                            th.palette.mode === 'dark'
                              ? 'rgba(99, 102, 241, 0.22)'
                              : 'rgba(36, 59, 107, 0.12)',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          insetInlineStart: 0,
                          top: '20%',
                          bottom: '20%',
                          width: '3.5px',
                          bgcolor: 'primary.main',
                          borderRadius: '4px',
                        },
                      }
                    : {
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          color: 'text.primary',
                        },
                      }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.15s ease',
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.84375rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 1.5, mx: 2 }} />

      {/* Planned Modules Navigation */}
      <Box sx={{ px: 2, pt: 0.5, pb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'text.disabled',
            fontSize: '0.6875rem',
            display: 'block',
          }}
        >
          {t('nav.pendingModules')}
        </Typography>
      </Box>

      <List sx={{ px: 1.25, py: 0 }}>
        {pendingNavItems.map((item) => {
          const Icon = item.icon;
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                selected={isSelected}
                sx={{
                  borderRadius: '10px',
                  py: 0.85,
                  px: 1.5,
                  color: 'text.secondary',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'text.primary',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: 'text.disabled' }}>
                  <Icon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    color: 'inherit',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
                <Chip
                  label={t('common.pending')}
                  size="small"
                  sx={{
                    height: 19,
                    fontSize: '0.625rem',
                    bgcolor: 'action.hover',
                    color: 'text.disabled',
                    fontWeight: 600,
                    borderRadius: '4px',
                    ml: isRtl ? 0 : 'auto',
                    mr: isRtl ? 'auto' : 0,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Modern Sidebar Footer User Card */}
      <Box
        sx={{
          mt: 'auto',
          p: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: (th) =>
            th.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.02)'
              : 'rgba(0, 0, 0, 0.01)',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="space-between">
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            component={RouterLink}
            to="/profile"
            sx={{
              minWidth: 0,
              flex: 1,
              textDecoration: 'none',
              color: 'inherit',
              p: 0.5,
              borderRadius: 2,
              transition: 'background-color 0.15s',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'text.primary',
                }}
              >
                {user?.name || t('directory.unnamedUser')}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.phoneNumber || ''}
              </Typography>
            </Box>
          </Stack>

          <Tooltip title={t('nav.signOut')}>
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                color: 'text.secondary',
                borderRadius: 2,
                p: 0.8,
                '&:hover': {
                  color: 'error.main',
                  bgcolor: (th) =>
                    th.palette.mode === 'dark'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(239, 68, 68, 0.08)',
                },
              }}
            >
              <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile temporary overlay drawer */}
      <Drawer
        anchor={isRtl ? 'right' : 'left'}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            bgcolor: 'background.paper',
            borderInlineEnd: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop In-Flow Sticky Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          width: DRAWER_WIDTH,
          minWidth: DRAWER_WIDTH,
          maxWidth: DRAWER_WIDTH,
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          borderInlineEnd: '1px solid',
          borderColor: 'divider',
          zIndex: 10,
          overflowY: 'auto',
        }}
      >
        {drawerContent}
      </Box>

      {/* Main Content & Top Navbar Column */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        {/* Modern Frosted-Glass Top Navbar (Sticky) */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            top: 0,
            zIndex: (th) => th.zIndex.drawer - 1,
            bgcolor: (th) =>
              th.palette.mode === 'dark'
                ? 'rgba(17, 24, 39, 0.8)'
                : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              minHeight: { xs: 58, sm: 64 },
              px: { xs: 1.5, sm: 2.5, md: 3 },
            }}
          >
            {/* Start Section: Mobile Toggle & Route Breadcrumbs */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 0.8,
                  }}
                >
                  <MenuIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}

              {/* Dynamic Page Indicator */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="caption"
                  sx={{
                    display: { xs: 'none', sm: 'inline' },
                    color: 'text.secondary',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                  }}
                >
                  {t('common.appName')}
                </Typography>
                <Box
                  component="span"
                  sx={{
                    display: { xs: 'none', sm: 'inline' },
                    color: 'text.disabled',
                    fontSize: '0.875rem',
                  }}
                >
                  /
                </Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: (th) =>
                      th.palette.mode === 'dark'
                        ? 'rgba(99, 102, 241, 0.12)'
                        : 'rgba(36, 59, 107, 0.06)',
                  }}
                >
                  {CurrentIcon && (
                    <CurrentIcon
                      sx={{
                        fontSize: 17,
                        color: 'primary.main',
                      }}
                    />
                  )}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentItem.label}
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            {/* End Section: Only Notification Icon, Theme Toggle, and Profile Dropdown Trigger */}
            <Stack direction="row" spacing={1.25} alignItems="center">
              {/* Notifications Icon with unread badge */}
              <Tooltip title={t('nav.notifications')}>
                <IconButton
                  component={RouterLink}
                  to="/notifications"
                  size="small"
                  aria-label={t('nav.notifications')}
                  sx={{
                    width: 36,
                    height: 36,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '10px',
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Badge
                    color="error"
                    badgeContent={unreadCount}
                    invisible={unreadCount === 0}
                    overlap="circular"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: isRtl ? 'left' : 'right',
                    }}
                  >
                    <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Theme Toggle (Dark / Light) */}
              <ThemeToggle
                size="small"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                }}
              />

              {/* Profile Avatar Button (The Closed Part - Opens Content on Click) */}
              <Tooltip title={user?.name || t('nav.myProfile')}>
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  aria-label="user account menu"
                  aria-controls={anchorEl ? 'profile-dropdown-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEl)}
                  sx={{
                    p: 0,
                    ml: 0.25,
                    border: '2px solid',
                    borderColor: anchorEl ? 'primary.main' : 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: isRtl ? 'left' : 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#22C55E',
                        color: '#22C55E',
                        boxShadow: (th) => `0 0 0 2px ${th.palette.background.paper}`,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Clean Profile & Options Dropdown Menu */}
              <Menu
                id="profile-dropdown-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: isRtl ? 'left' : 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: isRtl ? 'left' : 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    width: 270,
                    mt: 1.25,
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: (th) =>
                      th.palette.mode === 'dark'
                        ? '0 12px 32px rgba(0, 0, 0, 0.45)'
                        : '0 12px 32px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                  },
                }}
              >
                {/* User Info Header */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: (th) =>
                      th.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(0, 0, 0, 0.02)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {user?.name || t('directory.unnamedUser')}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {user?.phoneNumber || ''}
                      </Typography>
                      <Chip
                        label={user?.role || t('common.workspaceActive')}
                        size="small"
                        sx={{
                          mt: 0.5,
                          height: 19,
                          fontSize: '0.625rem',
                          bgcolor: 'action.hover',
                          fontWeight: 600,
                          borderRadius: '4px',
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>

                {/* Language Switcher Segment */}
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.6,
                      mb: 1,
                    }}
                  >
                    <TranslateOutlinedIcon sx={{ fontSize: 15 }} />
                    {isRtl ? 'زبان سامانه' : 'Language'}
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 0.75,
                      p: 0.4,
                      borderRadius: '8px',
                      bgcolor: (th) =>
                        th.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.04)'
                          : 'rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <Button
                      size="small"
                      onClick={() => handleLanguageSelect('en')}
                      variant={currentLang === 'en' ? 'contained' : 'text'}
                      sx={{
                        py: 0.4,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        textTransform: 'none',
                        boxShadow: 'none',
                        bgcolor: currentLang === 'en' ? 'primary.main' : 'transparent',
                        color: currentLang === 'en' ? '#fff' : 'text.secondary',
                        '&:hover': {
                          bgcolor: currentLang === 'en' ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    >
                      English
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleLanguageSelect('fa')}
                      variant={currentLang === 'fa' ? 'contained' : 'text'}
                      sx={{
                        py: 0.4,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        boxShadow: 'none',
                        bgcolor: currentLang === 'fa' ? 'primary.main' : 'transparent',
                        color: currentLang === 'fa' ? '#fff' : 'text.secondary',
                        '&:hover': {
                          bgcolor: currentLang === 'fa' ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    >
                      فارسی
                    </Button>
                  </Box>
                </Box>

                {/* Quick New Task Action */}
                <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Button
                    component={RouterLink}
                    to="/tasks"
                    onClick={handleMenuClose}
                    variant="contained"
                    fullWidth
                    size="small"
                    startIcon={<AddIcon sx={{ fontSize: 17 }} />}
                    sx={{
                      borderRadius: '8px',
                      py: 0.65,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: 'none',
                    }}
                  >
                    {t('tasks.createTask') || t('nav.quickNew')}
                  </Button>
                </Box>

                {/* Navigation Links */}
                <Box sx={{ py: 0.5 }}>
                  <MenuItem
                    component={RouterLink}
                    to="/profile"
                    onClick={handleMenuClose}
                    sx={{ py: 1, px: 2, borderRadius: '8px', mx: 0.75 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                      <PersonOutlineOutlinedIcon sx={{ fontSize: 19 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('nav.myProfile')}
                      primaryTypographyProps={{ fontSize: '0.84375rem', fontWeight: 500 }}
                    />
                  </MenuItem>

                  <MenuItem
                    component={RouterLink}
                    to="/company"
                    onClick={handleMenuClose}
                    sx={{ py: 1, px: 2, borderRadius: '8px', mx: 0.75 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                      <BusinessOutlinedIcon sx={{ fontSize: 19 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('nav.companyInfo')}
                      primaryTypographyProps={{ fontSize: '0.84375rem', fontWeight: 500 }}
                    />
                  </MenuItem>
                </Box>

                <Divider sx={{ my: 0.5 }} />

                {/* Sign Out */}
                <Box sx={{ p: 0.5 }}>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      py: 1,
                      px: 2,
                      borderRadius: '8px',
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: (th) =>
                          th.palette.mode === 'dark'
                            ? 'rgba(239, 68, 68, 0.12)'
                            : 'rgba(239, 68, 68, 0.06)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}>
                      <LogoutOutlinedIcon sx={{ fontSize: 19 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('nav.signOut')}
                      primaryTypographyProps={{
                        fontSize: '0.84375rem',
                        fontWeight: 600,
                      }}
                    />
                  </MenuItem>
                </Box>
              </Menu>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Main Content Page */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 3.5 },
            bgcolor: 'background.default',
          }}
        >
          {children || <Outlet />}
        </Box>

        {/* Global Dashboard Layout Footer */}
        <Box
          component="footer"
          sx={{
            mt: 'auto',
            py: 1.5,
            px: { xs: 2, sm: 3, md: 3.5 },
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            {t('common.copyright', { year: new Date().getFullYear() })}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>
              {t('common.appName')} • {t('common.appSubtitle')}
            </Typography>
            <Chip
              label={t('common.workspaceActive')}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.6875rem',
                bgcolor: 'action.hover',
                color: 'text.secondary',
                fontWeight: 600,
              }}
            />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
