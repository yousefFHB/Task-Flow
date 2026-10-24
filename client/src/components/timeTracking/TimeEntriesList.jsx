import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import {
  useGetTimeEntriesQuery,
  useDeleteTimeEntryMutation,
} from '../../Store/servises/timeTrackingApi/index.js';
import { useAppSelector } from '../../Store/hooks.js';
import { selectCurrentUser } from '../../Store/Slice/authSlice.js';
import TimeTrackingDialog from './TimeTrackingDialog.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import EmptyState from '../common/EmptyState.jsx';
import LoadingSkeleton from '../common/LoadingSkeleton.jsx';
import { formatDuration, formatDate, formatNumber } from '../../utils/formatters.js';

export default function TimeEntriesList({
  taskId = null,
  projectId = null,
  taskTitle = null,
}) {
  const { t } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useGetTimeEntriesQuery(
    taskId ? { taskId } : projectId ? { projectId } : {}
  );
  const [deleteTimeEntry, { isLoading: isDeleting }] = useDeleteTimeEntryMutation();

  const entries = data?.data || [];
  const totalMinutes = data?.totalMinutes || 0;

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteTimeEntry({ id: deletingId, taskId, projectId }).unwrap();
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete time entry:', err);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} height={60} />;
  }

  return (
    <Box>
      {/* Header bar with summary total and Log Time button */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AccessTimeOutlinedIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t('timeTracking.title')} ({formatNumber(entries.length)})
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {t('timeTracking.totalLogged')}: <span style={{ color: '#6366f1' }}>{formatDuration(totalMinutes)}</span>
          </Typography>
        </Stack>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {t('timeTracking.logTime')}
        </Button>
      </Stack>

      {entries.length === 0 ? (
        <EmptyState
          icon={AccessTimeOutlinedIcon}
          title={t('timeTracking.noTimeEntries')}
          description={t('timeTracking.title')}
          actionText={t('timeTracking.logTime')}
          onAction={handleOpenCreate}
        />
      ) : (
        <Stack spacing={1.5}>
          {entries.map((entry) => {
            const isAuthor = entry.userId === currentUser?.id;
            const dateStr = entry.date ? formatDate(entry.date) : '';

            return (
              <Card
                key={entry.id}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Avatar
                        src={entry.user?.avatar}
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          bgcolor: 'primary.main',
                        }}
                      >
                        {entry.user?.name ? entry.user.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>

                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {entry.user?.name || t('timeTracking.loggedBy')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            •
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {dateStr}
                          </Typography>
                        </Stack>

                        {entry.description && (
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, color: 'text.primary', whiteSpace: 'pre-line' }}
                          >
                            {entry.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          px: 1.25,
                          py: 0.3,
                          borderRadius: 1.5,
                          bgcolor: 'action.hover',
                          color: 'primary.main',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {formatDuration(entry.duration)}
                      </Typography>

                      {isAuthor && (
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title={t('common.details')}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(entry)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t('common.delete')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeletingId(entry.id)}
                            >
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Log Time Dialog */}
      <TimeTrackingDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingEntry(null);
        }}
        initialData={editingEntry}
        defaultProjectId={projectId}
        defaultTaskId={taskId}
        taskTitle={taskTitle}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title={t('common.delete')}
        message={t('timeTracking.deleteConfirm')}
        confirmText={t('common.delete')}
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </Box>
  );
}
