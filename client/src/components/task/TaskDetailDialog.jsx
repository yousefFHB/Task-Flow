import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Tabs,
  Tab,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Avatar,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import {
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
} from '../../Store/servises/taskApi/index.js';
import { useGetTaskTimeSummaryQuery } from '../../Store/servises/timeTrackingApi/index.js';
import TaskCommentsSection from './TaskCommentsSection.jsx';
import TaskHistoryTimeline from './TaskHistoryTimeline.jsx';
import TimeEntriesList from '../timeTracking/TimeEntriesList.jsx';
import TaskTimeSummaryCard from '../timeTracking/TaskTimeSummaryCard.jsx';
import { subscribeToTask, unsubscribeFromTask } from '../../utils/socket.js';
import LoadingSkeleton from '../common/LoadingSkeleton.jsx';
import { formatDate } from '../../utils/formatters.js';

const STATUS_KEYS = {
  TODO: { key: 'tasks.statuses.TODO', color: 'default' },
  IN_PROGRESS: { key: 'tasks.statuses.IN_PROGRESS', color: 'primary' },
  REVIEW: { key: 'tasks.statuses.REVIEW', color: 'warning' },
  DONE: { key: 'tasks.statuses.DONE', color: 'success' },
  CANCEL: { key: 'tasks.statuses.BACKLOG', color: 'error' },
};

const PRIORITY_KEYS = {
  LOW: { key: 'tasks.priorities.LOW', color: 'info' },
  MEDIUM: { key: 'tasks.priorities.MEDIUM', color: 'default' },
  HIGH: { key: 'tasks.priorities.HIGH', color: 'warning' },
  URGENT: { key: 'tasks.priorities.URGENT', color: 'error' },
};

export default function TaskDetailDialog({ taskId, open, onClose }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const { data: taskData, isLoading } = useGetTaskByIdQuery(taskId, {
    skip: !taskId || !open,
  });
  const { data: timeSummaryData } = useGetTaskTimeSummaryQuery(taskId, {
    skip: !taskId || !open,
  });

  const [updateStatus] = useUpdateTaskStatusMutation();
  const [updateTask] = useUpdateTaskMutation();

  const task = taskData?.data;
  const timeSummary = timeSummaryData?.data;

  // Real-time room subscription for this task
  useEffect(() => {
    if (open && taskId) {
      subscribeToTask(taskId);
      return () => {
        unsubscribeFromTask(taskId);
      };
    }
  }, [open, taskId]);

  if (!open) return null;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateStatus({ id: taskId, status: newStatus }).unwrap();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    try {
      await updateTask({ id: taskId, priority: newPriority }).unwrap();
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ p: 2.5, pb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                label={task?.project?.name || 'Project'}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                TASK #{taskId}
              </Typography>
            </Stack>

            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
              {task?.title || 'Loading task...'}
            </Typography>
          </Box>

          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {isLoading || !task ? (
          <LoadingSkeleton count={4} height={60} />
        ) : (
          <Grid container spacing={3}>
            {/* Left Column: Description & Tabs */}
            <Grid item xs={12} md={8}>
              {task.description ? (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase' }}>
                    {t('tasks.description')}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, color: 'text.primary', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {task.description}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontStyle: 'italic' }}>
                  {t('tasks.descriptionPlaceholder')}
                </Typography>
              )}

              {/* Time Tracking Overview Card */}
              <Box sx={{ mb: 3 }}>
                <TaskTimeSummaryCard
                  totalLoggedMinutes={timeSummary?.totalLoggedMinutes ?? task.totalLoggedMinutes ?? 0}
                  estimatedMinutes={task.estimatedMinutes}
                  storyPoints={task.storyPoints}
                />
              </Box>

              {/* Tabs for Comments, History, and Time Entries */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => setActiveTab(val)}
                  textColor="primary"
                  indicatorColor="primary"
                >
                  <Tab
                    icon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 17 }} />}
                    iconPosition="start"
                    label={t('tasks.tabComments')}
                    sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }}
                  />
                  <Tab
                    icon={<AccessTimeOutlinedIcon sx={{ fontSize: 17 }} />}
                    iconPosition="start"
                    label={t('tasks.tabTime')}
                    sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }}
                  />
                  <Tab
                    icon={<HistoryOutlinedIcon sx={{ fontSize: 17 }} />}
                    iconPosition="start"
                    label={t('tasks.tabHistory')}
                    sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }}
                  />
                </Tabs>
              </Box>

              {/* Tab Panels */}
              {activeTab === 0 && <TaskCommentsSection taskId={taskId} />}
              {activeTab === 1 && (
                <TimeEntriesList
                  taskId={taskId}
                  projectId={task.projectId}
                  taskTitle={task.title}
                />
              )}
              {activeTab === 2 && <TaskHistoryTimeline taskId={taskId} />}
            </Grid>

            {/* Right Column: Metadata Sidebar (Status, Priority, Assignee, Reporter) */}
            <Grid item xs={12} md={4}>
              <Stack
                spacing={2.5}
                sx={{
                  p: 2,
                  bgcolor: (th) =>
                    th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {/* Status Selector */}
                <FormControl fullWidth size="small">
                  <InputLabel>{t('tasks.status')}</InputLabel>
                  <Select
                    value={task.status}
                    label={t('tasks.status')}
                    onChange={handleStatusChange}
                  >
                    {Object.entries(STATUS_KEYS).map(([val, conf]) => (
                      <MenuItem key={val} value={val}>
                        <Chip
                          label={t(conf.key)}
                          size="small"
                          color={conf.color}
                          sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Priority Selector */}
                <FormControl fullWidth size="small">
                  <InputLabel>{t('tasks.priority')}</InputLabel>
                  <Select
                    value={task.priority}
                    label={t('tasks.priority')}
                    onChange={handlePriorityChange}
                  >
                    {Object.entries(PRIORITY_KEYS).map(([val, conf]) => (
                      <MenuItem key={val} value={val}>
                        <Chip
                          label={t(conf.key)}
                          size="small"
                          color={conf.color}
                          sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Divider />

                {/* Assignee */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    {t('tasks.assignedTo')}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      src={task.assignee?.avatar}
                      sx={{ width: 26, height: 26, fontSize: '0.75rem', bgcolor: 'primary.main' }}
                    >
                      {task.assignee?.name ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {task.assignee?.name || t('tasks.unassigned')}
                    </Typography>
                  </Stack>
                </Box>

                {/* Reporter */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    {t('tasks.reporter')}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      src={task.reporter?.avatar}
                      sx={{ width: 26, height: 26, fontSize: '0.75rem', bgcolor: 'grey.600' }}
                    >
                      {task.reporter?.name ? task.reporter.name.charAt(0).toUpperCase() : 'R'}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {task.reporter?.name || 'System'}
                    </Typography>
                  </Stack>
                </Box>

                {/* Due Date */}
                {task.dueDate && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      {t('tasks.dueDate')}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(task.dueDate)}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} variant="outlined" size="small">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
