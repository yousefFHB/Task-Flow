
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';

import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

import { useAppSelector } from '../../Store/hooks.js';
import { selectCurrentUser } from '../../Store/Slice/authSlice.js';

export default function OverviewPage() {
  const { t } = useTranslation();
  const user = useAppSelector(selectCurrentUser);

  const domainStatus = [
    {
      id: 'auth',
      domain: t('overview.domains.authTitle'),
      status: t('common.implemented'),
      details: t('overview.domains.authDetails'),
      badgeColor: 'success',
      isImplemented: true,
      icon: LockOutlinedIcon,
      color: '#6366f1',
      link: '/profile',
    },
    {
      id: 'users',
      domain: t('overview.domains.usersTitle'),
      status: t('common.implemented'),
      details: t('overview.domains.usersDetails'),
      badgeColor: 'success',
      isImplemented: true,
      icon: PeopleAltOutlinedIcon,
      color: '#0284c7',
      link: '/users',
    },
    {
      id: 'company',
      domain: t('overview.domains.companyTitle'),
      status: t('common.implemented'),
      details: t('overview.domains.companyDetails'),
      badgeColor: 'success',
      isImplemented: true,
      icon: BusinessOutlinedIcon,
      color: '#d97706',
      link: '/company',
    },
    {
      id: 'tasks',
      domain: t('overview.domains.tasksTitle'),
      status: t('common.implemented'),
      details: t('overview.domains.tasksDetails'),
      badgeColor: 'success',
      isImplemented: true,
      icon: AssignmentOutlinedIcon,
      color: '#059669',
      link: '/tasks',
    },
    {
      id: 'projects',
      domain: t('overview.domains.projectsTitle'),
      status: t('common.implemented'),
      details: t('overview.domains.projectsDetails'),
      badgeColor: 'success',
      isImplemented: true,
      icon: FolderOutlinedIcon,
      color: '#8b5cf6',
      link: '/projects',
    },
    {
      id: 'timeTracking',
      domain: t('overview.domains.timeTrackingTitle'),
      status: t('common.implemented'),
      details: t('overview.domains.timeTrackingDetails'),
      badgeColor: 'success',
      isImplemented: true,
      icon: AccessTimeOutlinedIcon,
      color: '#0d9488',
      link: '/tasks',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, width: '100%', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.75,
          }}
        >
          {t('overview.greeting', {
            name: user?.name || t('directory.unnamedUser'),
          })}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.6,
          }}
        >
          {t('overview.welcome')}
        </Typography>
      </Box>

      {/* Profile Summary Card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, sm: 3 },
            '&:last-child': {
              pb: { xs: 2.5, sm: 3 },
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2.5}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ minWidth: 0, flex: 1, width: '100%' }}
            >
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: 'primary.main',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    display: 'block',
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {t('overview.activeIdentity')}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: 'text.primary',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name || t('directory.unnamedUser')}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.4,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {t('overview.phoneLabel')}: {user?.phoneNumber || t('overview.notProvided')} •{' '}
                  {t('overview.userIdLabel')}: #{user?.id || '—'}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                flexShrink: 0,
              }}
            >
              <Button
                component={RouterLink}
                to="/profile"
                variant="outlined"
                size="small"
                startIcon={<PersonOutlineOutlinedIcon />}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                {t('overview.manageProfile')}
              </Button>

              <Button
                component={RouterLink}
                to="/users"
                variant="contained"
                size="small"
                startIcon={<PeopleAltOutlinedIcon />}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                {t('overview.exploreDirectory')}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* System Status Heading */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            color: 'text.primary',
          }}
        >
          {t('overview.systemStatusTitle')}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('overview.systemStatusSubtitle')}
        </Typography>
      </Box>

      {/* Equal-width and equal-height cards */}
      <Grid container spacing={2.5} alignItems="stretch">
        {domainStatus.map((item) => {
          const ItemIcon = item.icon;

          return (
            <Grid
              key={item.id}
              size={{ xs: 12, sm: 6, lg: 4 }}
              sx={{
                display: 'flex',
                minWidth: 0,
              }}
            >
              <Card
                component={RouterLink}
                to={item.link}
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  minWidth: 0,
                  minHeight: 240,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',

                  '&:hover': {
                    borderColor: item.color,
                    transform: 'translateY(-4px)',
                    boxShadow: (th) =>
                      th.palette.mode === 'dark'
                        ? '0 12px 28px rgba(0, 0, 0, 0.45)'
                        : '0 12px 28px rgba(0, 0, 0, 0.08)',

                    '& .accent-bar': {
                      opacity: 1,
                      height: 4,
                    },

                    '& .arrow-action': {
                      transform: 'translateX(3px)',
                      color: item.color,
                    },
                  },
                }}
              >
                {/* Accent Bar */}
                <Box
                  className="accent-bar"
                  sx={{
                    height: 3,
                    width: '100%',
                    flexShrink: 0,
                    bgcolor: item.color,
                    transition: 'all 0.2s ease',
                    opacity: 0.85,
                  }}
                />

                <CardContent
                  sx={{
                    p: 2.5,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:last-child': {
                      pb: 2.5,
                    },
                  }}
                >
                  {/* Card Header and Description */}
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1.5}
                      sx={{ mb: 2, minWidth: 0 }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                        sx={{ minWidth: 0, flex: 1 }}
                      >
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            bgcolor: (th) =>
                              th.palette.mode === 'dark'
                                ? `${item.color}22`
                                : `${item.color}14`,
                            color: item.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '1px solid',
                            borderColor: (th) =>
                              th.palette.mode === 'dark'
                                ? `${item.color}33`
                                : `${item.color}22`,
                          }}
                        >
                          <ItemIcon sx={{ fontSize: 20 }} />
                        </Box>

                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {item.domain}
                        </Typography>
                      </Stack>

                      <Chip
                        icon={
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: 'success.main',
                              boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
                              mr: -0.25,
                            }}
                          />
                        }
                        label={item.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          height: 22,
                          bgcolor: (th) =>
                            th.palette.mode === 'dark'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(16, 185, 129, 0.1)',
                          color: 'success.main',
                          border: '1px solid',
                          borderColor: (th) =>
                            th.palette.mode === 'dark'
                              ? 'rgba(16, 185, 129, 0.25)'
                              : 'rgba(16, 185, 129, 0.2)',
                          flexShrink: 0,
                          maxWidth: '45%',
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            px: 0.75,
                          },
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        overflowWrap: 'anywhere',
                        minHeight: '3em',
                      }}
                    >
                      {item.details}
                    </Typography>
                  </Box>

                  {/* Card Footer */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      pt: 1.75,
                      mt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        fontSize: '0.6875rem',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                      }}
                    >
                      {t('common.workspaceActive', 'Operational')}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      className="arrow-action"
                      sx={{
                        color: 'text.disabled',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      >
                        {t('common.details', 'Open')}
                      </Typography>

                      <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
