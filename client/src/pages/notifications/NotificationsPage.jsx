import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from '../../Store/servises/notificationApi/index.js';
import TaskDetailDialog from '../../components/task/TaskDetailDialog.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import { formatDate } from '../../utils/formatters.js';

const NOTIFICATION_ICONS = {
  TASK_ASSIGNED: AssignmentOutlinedIcon,
  TASK_STATUS_CHANGED: AssignmentOutlinedIcon,
  TASK_PRIORITY_CHANGED: AssignmentOutlinedIcon,
  TASK_COMMENTED: ChatBubbleOutlineOutlinedIcon,
  TIME_LOGGED: AccessTimeOutlinedIcon,
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [filterRead, setFilterRead] = useState('ALL');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const { data, isLoading } = useGetNotificationsQuery(
    filterRead === 'UNREAD' ? { isRead: false } : {}
  );
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = data?.data?.data || [];

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id).unwrap();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id).unwrap();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    if (item.taskId) {
      setSelectedTaskId(item.taskId);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            {t('notifications.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('notifications.subtitle')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant={filterRead === 'ALL' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterRead('ALL')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {t('notifications.filterAll')}
          </Button>
          <Button
            variant={filterRead === 'UNREAD' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterRead('UNREAD')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {t('notifications.filterUnread')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll || notifications.length === 0}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {t('notifications.markAllRead')}
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <LoadingSkeleton count={4} height={80} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={NotificationsNoneOutlinedIcon}
          title={t('notifications.noNotificationsTitle')}
          description={t('notifications.noNotificationsDesc')}
        />
      ) : (
        <Stack spacing={1.5}>
          {notifications.map((item) => {
            const Icon = NOTIFICATION_ICONS[item.type] || NotificationsNoneOutlinedIcon;
            const dateStr = item.createdAt ? formatDate(item.createdAt, { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <Card
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: item.isRead ? 'divider' : 'primary.main',
                  bgcolor: (th) =>
                    !item.isRead
                      ? th.palette.mode === 'dark'
                        ? 'rgba(99, 102, 241, 0.08)'
                        : 'rgba(99, 102, 241, 0.04)'
                      : 'background.paper',
                  cursor: item.taskId ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: !item.isRead ? 'primary.main' : 'action.hover',
                          color: !item.isRead ? '#fff' : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          mt: 0.25,
                        }}
                      >
                        <Icon sx={{ fontSize: 18 }} />
                      </Box>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {item.title}
                          </Typography>
                          {!item.isRead && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                              }}
                            />
                          )}
                        </Stack>

                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          {item.message}
                        </Typography>

                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {dateStr}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {!item.isRead && (
                        <Tooltip title={t('notifications.markAsRead')}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMarkRead(item.id, e)}
                            sx={{ color: 'primary.main' }}
                          >
                            <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title={t('common.delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDelete(item.id, e)}
                          sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                        >
                          <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Task Detail Dialog if opened from notification */}
      <TaskDetailDialog
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onClose={() => setSelectedTaskId(null)}
      />
    </Box>
  );
}
