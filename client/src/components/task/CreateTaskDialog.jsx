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
  MenuItem,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useCreateTaskMutation } from '../../Store/servises/taskApi/index.js';
import { useGetProjectsQuery } from '../../Store/servises/projectApi/index.js';

const STATUS_KEYS = [
  { value: 'TODO', key: 'tasks.statuses.TODO' },
  { value: 'IN_PROGRESS', key: 'tasks.statuses.IN_PROGRESS' },
  { value: 'REVIEW', key: 'tasks.statuses.REVIEW' },
  { value: 'DONE', key: 'tasks.statuses.DONE' },
];

const PRIORITY_KEYS = [
  { value: 'LOW', key: 'tasks.priorities.LOW' },
  { value: 'MEDIUM', key: 'tasks.priorities.MEDIUM' },
  { value: 'HIGH', key: 'tasks.priorities.HIGH' },
  { value: 'URGENT', key: 'tasks.priorities.URGENT' },
];

function CreateTaskForm({ onClose, defaultProjectId = null, projects = [] }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(
    defaultProjectId || (projects[0]?.id ? String(projects[0].id) : '')
  );
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg(t('validation.nameRequired'));
      return;
    }
    if (!projectId) {
      setErrorMsg(t('tasks.selectProject'));
      return;
    }

    const estimatedMinutes = estimatedHours ? Math.round(parseFloat(estimatedHours) * 60) : null;

    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || null,
        projectId: +projectId,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        storyPoints: storyPoints ? parseInt(storyPoints) : null,
        estimatedMinutes,
      }).unwrap();
      onClose();
    } catch (err) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to create task');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {errorMsg && (
            <Alert severity="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          )}

          <TextField
            label={t('tasks.title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            size="small"
            placeholder={t('tasks.titlePlaceholder')}
          />

          <TextField
            select
            label={t('tasks.project')}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            fullWidth
            size="small"
          >
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('tasks.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
            size="small"
            placeholder={t('tasks.descriptionPlaceholder')}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              select
              label={t('tasks.status')}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
              size="small"
            >
              {STATUS_KEYS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {t(opt.key)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={t('tasks.priority')}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              fullWidth
              size="small"
            >
              {PRIORITY_KEYS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {t(opt.key)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label={t('tasks.dueDate')}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />

            <TextField
              label={t('timeTracking.hours')}
              type="number"
              inputProps={{ min: 0, step: 0.5 }}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. 4.5"
            />

            <TextField
              label="Story Points"
              type="number"
              inputProps={{ min: 0 }}
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. 5"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isCreating} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isCreating}
          startIcon={isCreating && <CircularProgress size={16} color="inherit" />}
        >
          {t('tasks.createTask')}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default function CreateTaskDialog({ open, onClose, defaultProjectId = null }) {
  const { t } = useTranslation();
  const { data: projectsData } = useGetProjectsQuery(undefined, { skip: !open });
  const projects = projectsData?.data || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentOutlinedIcon color="primary" />
        {t('tasks.createTask')}
      </DialogTitle>
      {open && (
        <CreateTaskForm
          onClose={onClose}
          defaultProjectId={defaultProjectId}
          projects={projects}
        />
      )}
    </Dialog>
  );
}
