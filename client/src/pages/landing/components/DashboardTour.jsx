import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Tabs,
  Tab,
  Stack,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  IconButton,
  Button,
  Grid,
  useTheme,
} from '@mui/material';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

export default function DashboardTour() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isRtl = theme.direction === 'rtl';

  const [activeTab, setActiveTab] = useState(0);
  const [isTimerPlaying, setIsTimerPlaying] = useState(true);
  const [selectedTask, setSelectedTask] = useState('TF-104');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Mock Kanban data
  const kanbanColumns = [
    {
      id: 'backlog',
      title: isRtl ? 'بک‌لاگ' : 'Backlog',
      count: 2,
      color: '#64748B',
      tasks: [
        {
          id: 'TF-101',
          title: isRtl ? 'پیاده‌سازی ماژول احراز هویت دو مرحله‌ای' : 'Setup OAuth2 & 2FA Provider',
          priority: 'Medium',
          priorityColor: 'info',
          points: 5,
          assignee: 'A',
          assigneeName: 'Alex',
          tags: ['Security', 'Backend'],
        },
        {
          id: 'TF-103',
          title: isRtl ? 'بهینه‌سازی کوئری‌های گزارشات پیشرفته' : 'Optimize SQL reporting queries',
          priority: 'Low',
          priorityColor: 'default',
          points: 3,
          assignee: 'M',
          assigneeName: 'Maryam',
          tags: ['Database'],
        },
      ],
    },
    {
      id: 'inprogress',
      title: isRtl ? 'در حال انجام' : 'In Progress',
      count: 2,
      color: '#6366F1',
      tasks: [
        {
          id: 'TF-104',
          title: isRtl ? 'طراحی رابط کاربری ثبت زمان و تاریخچه' : 'Time Tracking & Worklog UI',
          priority: 'Urgent',
          priorityColor: 'error',
          points: 8,
          assignee: 'Y',
          assigneeName: 'Yousef',
          tags: ['Frontend', 'v2.4'],
          time: '2h 45m',
        },
        {
          id: 'TF-107',
          title: isRtl ? 'برقراری ارتباط بلادرنگ سوکت اعلان‌ها' : 'Socket.IO notification stream',
          priority: 'High',
          priorityColor: 'warning',
          points: 5,
          assignee: 'R',
          assigneeName: 'Reza',
          tags: ['WebSockets'],
        },
      ],
    },
    {
      id: 'inreview',
      title: isRtl ? 'در حال بررسی' : 'In Review',
      count: 1,
      color: '#F59E0B',
      tasks: [
        {
          id: 'TF-98',
          title: isRtl ? 'طراحی واکنش‌گرای راست‌به‌چپ با قلم وزیرمتن' : 'Bilingual RTL typography & themes',
          priority: 'High',
          priorityColor: 'warning',
          points: 5,
          assignee: 'S',
          assigneeName: 'Sara',
          tags: ['UI/UX', 'i18n'],
        },
      ],
    },
    {
      id: 'done',
      title: isRtl ? 'تکمیل‌شده' : 'Done',
      count: 3,
      color: '#10B981',
      tasks: [
        {
          id: 'TF-92',
          title: isRtl ? 'طراحی ساختار دیتابیس و مدل‌های پریزما' : 'Prisma schema & database migration',
          priority: 'High',
          priorityColor: 'success',
          points: 13,
          assignee: 'Y',
          assigneeName: 'Yousef',
          tags: ['Architecture'],
        },
      ],
    },
  ];

  return (
    <Box
      id="tour"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.015)',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
          <Chip
            label={t('landing.preview.title')}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700, borderRadius: 2 }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            {t('landing.preview.subtitle')}
          </Typography>
        </Stack>

        {/* Mockup Window Container */}
        <Card
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
            boxShadow: isDark
              ? '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)'
              : '0 25px 60px -15px rgba(15, 23, 42, 0.15), 0 0 30px rgba(36, 59, 107, 0.08)',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {/* macOS Window Top Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 1.5,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Window Traffic Lights */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#EF4444' }} />
              <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#F59E0B' }} />
              <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#10B981' }} />
            </Stack>

            {/* Simulated Window Breadcrumb */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                bgcolor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.6)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                px: 2,
                py: 0.4,
              }}
            >
              <FiberManualRecordIcon sx={{ fontSize: 10, color: '#10B981' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                TaskFlow Workspace • {t('landing.preview.activeSprint')}
              </Typography>
            </Stack>

            {/* Quick Live Badge */}
            <Chip
              label={t('landing.preview.completedBadge')}
              size="small"
              color="success"
              sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
            />
          </Box>

          {/* Interactive Module Tabs */}
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minHeight: 52,
                },
              }}
            >
              <Tab
                icon={<ViewKanbanOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label={t('landing.preview.tabKanban')}
              />
              <Tab
                icon={<AccessTimeIcon fontSize="small" />}
                iconPosition="start"
                label={t('landing.preview.tabTime')}
              />
              <Tab
                icon={<GroupsOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label={t('landing.preview.tabTeams')}
              />
              <Tab
                icon={<NotificationsActiveOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label={t('landing.preview.tabLive')}
              />
            </Tabs>
          </Box>

          {/* Tab 0: Kanban Board Mockup */}
          {activeTab === 0 && (
            <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: isDark ? '#0B0F19' : '#F8FAFC', minHeight: 460 }}>
              <Grid container spacing={2.5}>
                {kanbanColumns.map((col) => (
                  <Grid item xs={12} sm={6} md={3} key={col.id}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        border: '1px solid',
                        borderColor: 'divider',
                        height: '100%',
                      }}
                    >
                      {/* Column Header */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1.5, px: 0.5 }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col.color }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
                            {col.title}
                          </Typography>
                        </Stack>
                        <Chip
                          label={col.count}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                        />
                      </Stack>

                      {/* Task Cards */}
                      <Stack spacing={1.5}>
                        {col.tasks.map((task) => {
                          const isSelected = selectedTask === task.id;
                          return (
                            <Card
                              key={task.id}
                              onClick={() => setSelectedTask(task.id)}
                              sx={{
                                p: 1.75,
                                borderRadius: 2.5,
                                cursor: 'pointer',
                                bgcolor: isDark ? '#111827' : '#FFFFFF',
                                border: '1px solid',
                                borderColor: isSelected ? 'primary.main' : 'divider',
                                boxShadow: isSelected
                                  ? '0 4px 14px rgba(99, 102, 241, 0.25)'
                                  : '0 2px 6px rgba(0, 0, 0, 0.04)',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  borderColor: 'primary.light',
                                },
                              }}
                            >
                              <Stack spacing={1.25}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 700,
                                      color: 'primary.main',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    {task.id}
                                  </Typography>
                                  <Chip
                                    label={task.priority}
                                    color={task.priorityColor}
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700 }}
                                  />
                                </Stack>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.84rem',
                                    color: 'text.primary',
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {task.title}
                                </Typography>

                                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                  {task.tags.map((tag) => (
                                    <Chip
                                      key={tag}
                                      label={tag}
                                      size="small"
                                      variant="outlined"
                                      sx={{ height: 18, fontSize: '0.625rem' }}
                                    />
                                  ))}
                                </Stack>

                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  sx={{ pt: 0.5 }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 22,
                                      height: 22,
                                      fontSize: '0.7rem',
                                      bgcolor: 'primary.main',
                                      color: '#FFFFFF',
                                    }}
                                  >
                                    {task.assignee}
                                  </Avatar>
                                  {task.time ? (
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <AccessTimeIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
                                        {task.time}
                                      </Typography>
                                    </Stack>
                                  ) : (
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                                      {task.points} pts
                                    </Typography>
                                  )}
                                </Stack>
                              </Stack>
                            </Card>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Tab 1: Time Tracking Mockup */}
          {activeTab === 1 && (
            <Box sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: isDark ? '#0B0F19' : '#F8FAFC', minHeight: 460 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: isDark ? '#111827' : '#FFFFFF',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack spacing={2.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {t('landing.preview.timerRunning')}
                        </Typography>
                        <Chip
                          icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: '#10B981' }} />}
                          label="ACTIVE"
                          size="small"
                          color="success"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                        />
                      </Stack>

                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            fontFamily: 'monospace',
                            color: 'primary.main',
                          }}
                        >
                          02:45:18
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          TF-104: Time Tracking & Worklog UI
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1.5} justifyContent="center">
                        <Button
                          variant="contained"
                          color={isTimerPlaying ? 'warning' : 'primary'}
                          onClick={() => setIsTimerPlaying(!isTimerPlaying)}
                          startIcon={isTimerPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                          sx={{ borderRadius: 2, px: 3 }}
                        >
                          {isTimerPlaying ? (isRtl ? 'توقف موقت' : 'Pause') : (isRtl ? 'ادامه' : 'Resume')}
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          startIcon={<CheckCircleOutlineIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          {isRtl ? 'ثبت کارکرد' : 'Log Hours'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: isDark ? '#111827' : '#FFFFFF',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack spacing={2.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {isRtl ? 'خلاصه کارکرد اسپرینت' : 'Sprint Worklog Analytics'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {t('landing.preview.loggedHours')}
                        </Typography>
                      </Stack>

                      <Box>
                        <LinearProgress
                          variant="determinate"
                          value={80}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {isRtl ? '۸۰٪ تکمیل شده' : '80% of estimated hours logged'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            8h remaining
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Recent Worklogs */}
                      <Stack spacing={1.5} sx={{ pt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                          {isRtl ? 'آخرین گزارش‌های کاری ثبت‌شده' : 'Recent Worklogs'}
                        </Typography>

                        {[
                          { user: 'Yousef', time: '2h 45m', task: 'TF-104 Frontend layout', date: 'Today' },
                          { user: 'Sara', time: '4h 15m', task: 'TF-98 Persian RTL typography', date: 'Yesterday' },
                          { user: 'Reza', time: '3h 30m', task: 'TF-107 Socket streaming events', date: '2 days ago' },
                        ].map((log, idx) => (
                          <Stack
                            key={idx}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                              p: 1.25,
                              borderRadius: 2,
                              bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Stack direction="row" spacing={1.25} alignItems="center">
                              <Avatar sx={{ width: 26, height: 26, fontSize: '0.75rem', bgcolor: 'primary.light' }}>
                                {log.user.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                  {log.task}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {log.user} • {log.date}
                                </Typography>
                              </Box>
                            </Stack>
                            <Chip label={log.time} size="small" sx={{ fontWeight: 700, height: 22 }} />
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Tab 2: Team Roster Mockup */}
          {activeTab === 2 && (
            <Box sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: isDark ? '#0B0F19' : '#F8FAFC', minHeight: 460 }}>
              <Grid container spacing={2.5}>
                {[
                  { name: 'Yousef F.', role: 'Tech Lead / Fullstack', status: 'Online', tasks: 4, hours: '38h' },
                  { name: 'Sara Kamali', role: 'Senior Product Designer', status: 'Online', tasks: 3, hours: '35h' },
                  { name: 'Reza Mohammadi', role: 'DevOps & Backend Engineer', status: 'Away', tasks: 2, hours: '32h' },
                  { name: 'Maryam Rad', role: 'QA & Automation Specialist', status: 'Online', tasks: 5, hours: '40h' },
                ].map((member, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Card
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        textAlign: 'center',
                        bgcolor: isDark ? '#111827' : '#FFFFFF',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'transform 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)' },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 52,
                          height: 52,
                          mx: 'auto',
                          mb: 1.5,
                          bgcolor: 'primary.main',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {member.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                        {member.role}
                      </Typography>
                      <Chip
                        label={member.status}
                        size="small"
                        color={member.status === 'Online' ? 'success' : 'default'}
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, mb: 2 }}
                      />
                      <Stack
                        direction="row"
                        justifyContent="space-around"
                        sx={{
                          pt: 1.5,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {isRtl ? 'وظایف' : 'Tasks'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {member.tasks}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {isRtl ? 'ساعت' : 'Hours'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {member.hours}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Tab 3: Real-Time Live Activity Feed */}
          {activeTab === 3 && (
            <Box sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: isDark ? '#0B0F19' : '#F8FAFC', minHeight: 460 }}>
              <Card
                sx={{
                  maxWidth: 700,
                  mx: 'auto',
                  p: 3,
                  borderRadius: 3,
                  bgcolor: isDark ? '#111827' : '#FFFFFF',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: '#10B981',
                        boxShadow: '0 0 10px #10B981',
                      }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {isRtl ? 'جریان وب‌سوکت بلادرنگ (Socket.IO)' : 'Live WebSocket Stream (Socket.IO)'}
                    </Typography>
                  </Stack>
                  <Chip label="ONLINE" color="success" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                </Stack>

                <Stack spacing={2}>
                  {[
                    {
                      type: 'TASK_STATUS_CHANGED',
                      title: isRtl ? 'تغییر وضعیت تسک TF-104 به «در حال انجام»' : 'Status Transition: TF-104 moved to In Progress',
                      user: 'Yousef F.',
                      time: isRtl ? 'چند لحظه پیش' : 'Just now',
                      color: 'primary.main',
                    },
                    {
                      type: 'TASK_COMMENT',
                      title: isRtl ? 'سارا نظری ثبت کرد: «قلم‌ها و رنگ‌های دارک مود تأیید شد»' : 'Sara commented on TF-98: "Theme tokens looking crisp!"',
                      user: 'Sara K.',
                      time: isRtl ? '۲ دقیقه پیش' : '2m ago',
                      color: 'info.main',
                    },
                    {
                      type: 'TIME_LOGGED',
                      title: isRtl ? 'ثبت ۲ ساعت و ۴۵ دقیقه کارکرد بر روی TF-104' : 'Worklog added: 2h 45m on TF-104',
                      user: 'Yousef F.',
                      time: isRtl ? '۱۲ دقیقه پیش' : '12m ago',
                      color: 'warning.main',
                    },
                    {
                      type: 'PROJECT_MILESTONE',
                      title: isRtl ? 'رسیدن به ۸۴٪ اهداف اسپرینت ۴' : 'Sprint 04 milestone reached (84% complete)',
                      user: 'System Bot',
                      time: isRtl ? '۱ ساعت پیش' : '1h ago',
                      color: 'success.main',
                    },
                  ].map((evt, idx) => (
                    <Stack
                      key={idx}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: evt.color,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.84rem' }}>
                          {evt.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {evt.user} • {evt.time}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}
