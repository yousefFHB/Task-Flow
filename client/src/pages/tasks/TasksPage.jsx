
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useGetTasksQuery } from '../../Store/servises/taskApi/index.js';
import { useGetProjectsQuery } from '../../Store/servises/projectApi/index.js';
import TaskDetailDialog from '../../components/task/TaskDetailDialog.jsx';
import CreateTaskDialog from '../../components/task/CreateTaskDialog.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import { formatDate, formatNumber } from '../../utils/formatters.js';

const STATUS_COLUMNS = [
  { key: 'TODO', labelKey: 'tasks.statuses.TODO', color: '#94a3b8' },
  { key: 'IN_PROGRESS', labelKey: 'tasks.statuses.IN_PROGRESS', color: '#3b82f6' },
  { key: 'REVIEW', labelKey: 'tasks.statuses.REVIEW', color: '#f59e0b' },
  { key: 'DONE', labelKey: 'tasks.statuses.DONE', color: '#10b981' },
];

const PRIORITY_COLORS = {
  LOW: 'info',
  MEDIUM: 'default',
  HIGH: 'warning',
  URGENT: 'error',
};

export default function TasksPage() {
  const { t } = useTranslation();

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const { data: projectsData } = useGetProjectsQuery();

  const { data: tasksData, isLoading } = useGetTasksQuery({
    search: search || undefined,
    projectId: filterProject || undefined,
    priority: filterPriority || undefined,
  });

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 0.5,
            }}
          >
            {t('tasks.pageTitle')}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('tasks.pageSubtitle')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            borderRadius: 2,
            px: 2.5,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {t('tasks.createTask')}
        </Button>
      </Stack>

      {/* Filter Bar */}
      <Card
        elevation={0}
        sx={{
          mb: 3.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems="stretch"
        >
          <TextField
            placeholder={t('tasks.searchTasks')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              width: { xs: '100%', md: 'auto' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon
                    sx={{ fontSize: 20, color: 'text.secondary' }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <TextField
              select
              label={t('tasks.project')}
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 160 },
              }}
            >
              <MenuItem value="">{t('tasks.allProjects')}</MenuItem>

              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={t('tasks.priority')}
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 140 },
              }}
            >
              <MenuItem value="">{t('tasks.allPriorities')}</MenuItem>
              <MenuItem value="LOW">{t('tasks.priorities.LOW')}</MenuItem>
              <MenuItem value="MEDIUM">{t('tasks.priorities.MEDIUM')}</MenuItem>
              <MenuItem value="HIGH">{t('tasks.priorities.HIGH')}</MenuItem>
              <MenuItem value="URGENT">{t('tasks.priorities.URGENT')}</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Card>

      {/* Board / Kanban Columns */}
      {isLoading ? (
        <LoadingSkeleton count={4} height={200} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={AssignmentOutlinedIcon}
          title={t('tasks.noTasksTitle')}
          description={t('tasks.noTasksDesc')}
          actionText={t('tasks.createTask')}
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <Grid container spacing={2.5}>
          {STATUS_COLUMNS.map((col) => {
            const colTasks = tasks.filter((task) => task.status === col.key);

            return (
              <Grid
                key={col.key}
                size={{ xs: 12, sm: 6, lg: 3 }}
              >
                <Box
                  sx={{
                    bgcolor: (th) =>
                      th.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(0, 0, 0, 0.02)',
                    p: 1.5,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    minHeight: 500,
                  }}
                >
                  {/* Column Header */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2, px: 0.5 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: col.color,
                        }}
                      />

                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                        }}
                      >
                        {t(col.labelKey)}
                      </Typography>
                    </Stack>

                    <Chip
                      label={formatNumber(colTasks.length)}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        bgcolor: 'action.hover',
                      }}
                    />
                  </Stack>

                  {/* Tasks in Column */}
                  <Stack spacing={1.5}>
                    {colTasks.map((task) => (
                      <Card
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 2,
                            '&:last-child': { pb: 2 },
                          }}
                        >
                          <Stack spacing={1.25}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              spacing={1}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 600,
                                  color: 'primary.main',
                                  fontSize: '0.6875rem',
                                  minWidth: 0,
                                  overflowWrap: 'anywhere',
                                }}
                              >
                                {task.project?.name || 'Project'} • #{task.id}
                              </Typography>

                              <Chip
                                label={task.priority}
                                size="small"
                                color={
                                  PRIORITY_COLORS[task.priority] || 'default'
                                }
                                sx={{
                                  height: 18,
                                  fontSize: '0.625rem',
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              />
                            </Stack>

                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                lineHeight: 1.4,
                                color: 'text.primary',
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {task.title}
                            </Typography>

                            {task.description && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.4,
                                }}
                              >
                                {task.description}
                              </Typography>
                            )}

                            {/* Footer: Due date, comments, time, assignee */}
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              spacing={1}
                              sx={{
                                pt: 1,
                                borderTop: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1.25}
                                alignItems="center"
                                sx={{
                                  minWidth: 0,
                                  flexWrap: 'wrap',
                                  rowGap: 0.5,
                                }}
                              >
                                {task._count?.comments > 0 && (
                                  <Stack
                                    direction="row"
                                    spacing={0.4}
                                    alignItems="center"
                                  >
                                    <ChatBubbleOutlineOutlinedIcon
                                      sx={{
                                        fontSize: 13,
                                        color: 'text.secondary',
                                      }}
                                    />

                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.6875rem',
                                      }}
                                    >
                                      {task._count.comments}
                                    </Typography>
                                  </Stack>
                                )}

                                {task._count?.timeEntries > 0 && (
                                  <Stack
                                    direction="row"
                                    spacing={0.4}
                                    alignItems="center"
                                  >
                                    <AccessTimeOutlinedIcon
                                      sx={{
                                        fontSize: 13,
                                        color: 'text.secondary',
                                      }}
                                    />

                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.6875rem',
                                      }}
                                    >
                                      {task._count.timeEntries}
                                    </Typography>
                                  </Stack>
                                )}

                                {task.dueDate && (
                                  <Stack
                                    direction="row"
                                    spacing={0.4}
                                    alignItems="center"
                                  >
                                    <CalendarTodayOutlinedIcon
                                      sx={{
                                        fontSize: 13,
                                        color: 'text.secondary',
                                      }}
                                    />

                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.6875rem',
                                      }}
                                    >
                                      {formatDate(task.dueDate)}
                                    </Typography>
                                  </Stack>
                                )}
                              </Stack>

                              <Tooltip
                                title={
                                  task.assignee?.name ||
                                  t('tasks.unassigned')
                                }
                              >
                                <Avatar
                                  src={task.assignee?.avatar}
                                  sx={{
                                    width: 22,
                                    height: 22,
                                    fontSize: '0.6875rem',
                                    bgcolor: 'primary.main',
                                    flexShrink: 0,
                                  }}
                                >
                                  {task.assignee?.name
                                    ? task.assignee.name
                                        .charAt(0)
                                        .toUpperCase()
                                    : 'U'}
                                </Avatar>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onClose={() => setSelectedTaskId(null)}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        defaultProjectId={filterProject}
      />
    </Box>
  );
}
