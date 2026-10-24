import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import {
  useCreateTimeEntryMutation,
  useUpdateTimeEntryMutation,
} from '../../Store/servises/timeTrackingApi/index.js';
import { useGetProjectsQuery } from '../../Store/servises/projectApi/index.js';

function TimeTrackingForm({
  onClose,
  initialData = null,
  defaultProjectId = null,
  defaultTaskId = null,
  taskTitle = null,
}) {
  const { t } = useTranslation();
  const initialDuration = initialData?.duration || 0;
  const [projectId, setProjectId] = useState(initialData?.projectId || defaultProjectId || '');
  const [durationHours, setDurationHours] = useState(
    initialData ? String(Math.floor(initialDuration / 60) || '') : ''
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialData ? String(initialDuration % 60 || '') : ''
  );
  const [date, setDate] = useState(
    initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: projectsData, isLoading: isLoadingProjects } = useGetProjectsQuery();
  const [createTimeEntry, { isLoading: isCreating }] = useCreateTimeEntryMutation();
  const [updateTimeEntry, { isLoading: isUpdating }] = useUpdateTimeEntryMutation();

  const isEditing = Boolean(initialData?.id);
  const isSaving = isCreating || isUpdating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const hours = parseInt(durationHours) || 0;
    const minutes = parseInt(durationMinutes) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes <= 0) {
      setErrorMsg(t('timeTracking.invalidDuration'));
      return;
    }

    const targetProjectId = projectId || defaultProjectId;
    if (!targetProjectId) {
      setErrorMsg(t('timeTracking.selectProject'));
      return;
    }

    try {
      if (isEditing) {
        await updateTimeEntry({
          id: initialData.id,
          duration: totalMinutes,
          date: new Date(date).toISOString(),
          description: description.trim() || null,
          taskId: defaultTaskId || initialData.taskId,
          projectId: targetProjectId,
        }).unwrap();
      } else {
        await createTimeEntry({
          projectId: +targetProjectId,
          taskId: defaultTaskId ? +defaultTaskId : null,
          duration: totalMinutes,
          date: new Date(date).toISOString(),
          description: description.trim() || null,
        }).unwrap();
      }
      onClose();
    } catch (err) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to save time entry');
    }
  };

  const projects = projectsData?.data || [];

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {errorMsg && (
            <Alert severity="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          )}

          {taskTitle && (
            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                TASK
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {taskTitle}
              </Typography>
            </Box>
          )}

          {!defaultProjectId && (
            <TextField
              select
              label={t('tasks.project')}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              disabled={isLoadingProjects || isEditing}
              size="small"
              fullWidth
            >
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
              {t('timeTracking.duration')}
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label={t('timeTracking.hours')}
                type="number"
                inputProps={{ min: 0, max: 168 }}
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label={t('timeTracking.minutes')}
                type="number"
                inputProps={{ min: 0, max: 59 }}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                size="small"
                fullWidth
              />
            </Stack>
          </Box>

          <TextField
            label={t('timeTracking.workDate')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />

          <TextField
            label={t('timeTracking.workDescription')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            placeholder={t('timeTracking.workDescriptionPlaceholder')}
            size="small"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSaving} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSaving}
          startIcon={isSaving && <CircularProgress size={16} color="inherit" />}
        >
          {isEditing ? t('common.save') : t('timeTracking.logTime')}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default function TimeTrackingDialog({ open, onClose, ...props }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTimeOutlinedIcon color="primary" />
        {props.initialData?.id ? t('timeTracking.editTime') : t('timeTracking.logTime')}
      </DialogTitle>
      {open && <TimeTrackingForm onClose={onClose} {...props} />}
    </Dialog>
  );
}
