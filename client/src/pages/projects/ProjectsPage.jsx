import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

import {
  useGetProjectsQuery,
  useCreateProjectMutation,
} from '../../Store/servises/projectApi/index.js';
import { useGetCompaniesQuery } from '../../Store/servises/companyApi/index.js';
import { useGetTeamsQuery } from '../../Store/servises/teamApi/index.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import ProjectRatePanel from '../../components/earnings/ProjectRatePanel.jsx';
import ProjectMemberRatesPanel from '../../components/earnings/ProjectMemberRatesPanel.jsx';
import ProjectEarningsReport from '../../components/earnings/ProjectEarningsReport.jsx';
import { useAppSelector } from '../../Store/hooks.js';
import { selectCurrentUser } from '../../Store/Slice/authSlice.js';
import { formatDuration, formatNumber } from '../../utils/formatters.js';

export default function ProjectsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [earningsProject, setEarningsProject] = useState(null);
  const [isEarningsAdmin, setIsEarningsAdmin] = useState(false);
  const [earningsTab, setEarningsTab] = useState(0);

  const { data: projectsData, isLoading } = useGetProjectsQuery();
  const { data: companiesData } = useGetCompaniesQuery();
  const { data: teamsData } = useGetTeamsQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();

  const projects = projectsData?.data || [];
  const companies = companiesData?.data || [];
  const teams = teamsData?.data || [];

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setCompanyId(companies[0]?.company?.id ? String(companies[0].company.id) : companies[0]?.id ? String(companies[0].id) : '');
    setTeamId(teams[0]?.team?.id ? String(teams[0].team.id) : teams[0]?.id ? String(teams[0].id) : '');
    setDeadline('');
    setErrorMsg('');
    setCreateOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(t('validation.nameRequired'));
      return;
    }
    if (!companyId || !teamId) {
      setErrorMsg(t('common.genericRequired'));
      return;
    }

    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || null,
        companyId: +companyId,
        teamId: +teamId,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      }).unwrap();
      setCreateOpen(false);
    } catch (err) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to create project');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3.5 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            {t('projects.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('projects.subtitle')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2, px: 2.5, py: 1, textTransform: 'none', fontWeight: 600 }}
        >
          {t('projects.createProject')}
        </Button>
      </Stack>

      {isLoading ? (
        <LoadingSkeleton count={3} height={150} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderOutlinedIcon}
          title={t('projects.noProjectsTitle')}
          description={t('projects.noProjectsDesc')}
          actionText={t('projects.createProject')}
          onAction={handleOpenCreate}
        />
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => navigate('/tasks')}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: (th) =>
                          th.palette.mode === 'dark'
                            ? 'rgba(99, 102, 241, 0.15)'
                            : 'rgba(36, 59, 107, 0.07)',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: (th) =>
                          th.palette.mode === 'dark'
                            ? 'rgba(99, 102, 241, 0.2)'
                            : 'rgba(36, 59, 107, 0.12)',
                      }}
                    >
                      <FolderOutlinedIcon sx={{ fontSize: 22 }} />
                    </Box>

                    {project.team?.name && (
                      <Chip
                        icon={<GroupsOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                        label={project.team.name}
                        size="small"
                        sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
                      />
                    )}
                  </Stack>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    {project.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.5,
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    {project.description || t('projects.descriptionPlaceholder')}
                  </Typography>

                  {/* Hourly Rate & Earnings action */}
                  {(() => {
                    const companyMembership = companies.find(
                      (c) => (c.company?.id || c.companyId || c.id) === project.companyId
                    );
                    const isCompanyOwner = companyMembership?.role === 'OWNER';
                    const isCompanyAdmin = companyMembership?.role === 'ADMIN';
                    const isProjectCreator = Boolean(project.creatorId && project.creatorId === currentUser?.id);
                    const canManage = isCompanyOwner || isProjectCreator;
                    const canViewReport = canManage || isCompanyAdmin;

                    return (
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        {project.hourlyRateCents !== null && project.hourlyRateCents !== undefined ? (
                          <Chip
                            icon={<AttachMoneyOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                            label={`${(project.hourlyRateCents / 100).toFixed(2)} ${project.currency || 'USD'}/hr`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ height: 24, fontSize: '0.6875rem', fontWeight: 700 }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                            {t('earnings.noRateSet')}
                          </Typography>
                        )}

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AttachMoneyOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEarningsProject(project);
                            setIsEarningsAdmin(canViewReport);
                            setEarningsTab(0);
                          }}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            py: 0.3,
                            px: 1.25,
                            borderRadius: 1.5,
                          }}
                        >
                          {canManage ? t('earnings.manageRateAndReports') : t('earnings.viewRate')}
                        </Button>
                      </Stack>
                    );
                  })()}

                  {/* Metrics Footer */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <AssignmentOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {formatNumber(project._count?.tasks || 0)} {t('projects.openTasks')}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatDuration(project.totalLoggedMinutes || 0)} {t('projects.timeLogged')}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Project Modal */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('projects.createProject')}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

              <TextField
                label={t('projects.projectName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
                placeholder={t('projects.projectNamePlaceholder')}
              />

              <TextField
                select
                label={t('projects.company')}
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
                fullWidth
                size="small"
              >
                {companies.map((c) => {
                  const cId = c.company?.id || c.id;
                  const cName = c.company?.name || c.name;
                  return (
                    <MenuItem key={cId} value={cId}>
                      {cName}
                    </MenuItem>
                  );
                })}
              </TextField>

              <TextField
                select
                label={t('projects.team')}
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                required
                fullWidth
                size="small"
              >
                {teams.map((tItem) => {
                  const tId = tItem.team?.id || tItem.id;
                  const tName = tItem.team?.name || tItem.name;
                  return (
                    <MenuItem key={tId} value={tId}>
                      {tName}
                    </MenuItem>
                  );
                })}
              </TextField>

              <TextField
                label={t('projects.description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                size="small"
                placeholder={t('projects.descriptionPlaceholder')}
              />

              <TextField
                label={t('projects.deadline')}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setCreateOpen(false)} disabled={isCreating} color="inherit">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating}
              startIcon={isCreating && <CircularProgress size={16} />}
            >
              {t('projects.createProject')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Project Rate & Team Earnings Modal */}
      <Dialog
        open={Boolean(earningsProject)}
        onClose={() => setEarningsProject(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            p: { xs: 2, sm: 2.5 },
            pb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <AttachMoneyOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {earningsProject?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('earnings.manageRateAndReports', 'Project Rate & Team Earnings')}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            size="small"
            onClick={() => setEarningsProject(null)}
            sx={{
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 0.75,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {isEarningsAdmin && (
          <Box sx={{ px: { xs: 2, sm: 2.5 }, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tabs
              value={earningsTab}
              onChange={(e, val) => setEarningsTab(val)}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                icon={<AttachMoneyOutlinedIcon sx={{ fontSize: '18px !important' }} />}
                iconPosition="start"
                label={t('earnings.hourlyRate', 'Rate Settings')}
                sx={{ fontWeight: 600, textTransform: 'none', minHeight: 48, fontSize: '0.84rem' }}
              />
              <Tab
                icon={<AssessmentOutlinedIcon sx={{ fontSize: '18px !important' }} />}
                iconPosition="start"
                label={t('earnings.teamReport', 'Earnings Report')}
                sx={{ fontWeight: 600, textTransform: 'none', minHeight: 48, fontSize: '0.84rem' }}
              />
            </Tabs>
          </Box>
        )}

        <DialogContent dividers sx={{ p: { xs: 2, sm: 2.5 } }}>
          {earningsProject && (
            earningsTab === 0 ? (
              <Stack spacing={2.5}>
                <ProjectRatePanel projectId={earningsProject.id} isAdmin={isEarningsAdmin} />
                <ProjectMemberRatesPanel projectId={earningsProject.id} isAdmin={isEarningsAdmin} />
              </Stack>
            ) : (
              <ProjectEarningsReport projectId={earningsProject.id} />
            )
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setEarningsProject(null)} color="inherit" sx={{ borderRadius: 2 }}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
