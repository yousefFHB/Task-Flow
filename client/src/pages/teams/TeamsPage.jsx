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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

import {
  useGetTeamsQuery,
  useCreateTeamMutation,
  useAddTeamMemberMutation,
} from '../../Store/servises/teamApi/index.js';
import { useGetCompaniesQuery } from '../../Store/servises/companyApi/index.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';

export default function TeamsPage() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: teamsData, isLoading } = useGetTeamsQuery();
  const { data: companiesData } = useGetCompaniesQuery();
  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [addMember, { isLoading: isAddingMember }] = useAddTeamMemberMutation();

  const teams = teamsData?.data || [];
  const companies = companiesData?.data || [];

  const handleOpenCreate = () => {
    setTeamName('');
    setCompanyId(companies[0]?.company?.id ? String(companies[0].company.id) : companies[0]?.id ? String(companies[0].id) : '');
    setErrorMsg('');
    setCreateOpen(true);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!teamName.trim() || !companyId) {
      setErrorMsg(t('common.genericRequired'));
      return;
    }
    try {
      await createTeam({ name: teamName.trim(), companyId: +companyId }).unwrap();
      setCreateOpen(false);
    } catch (err) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to create team');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!memberPhone.trim() || !selectedTeamId) {
      setErrorMsg(t('validation.phoneRequired'));
      return;
    }
    try {
      await addMember({ id: selectedTeamId, phoneNumber: memberPhone.trim() }).unwrap();
      setAddMemberOpen(false);
      setMemberPhone('');
    } catch (err) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to add member to team');
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
            {t('teams.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('teams.subtitle')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2, px: 2.5, py: 1, textTransform: 'none', fontWeight: 600 }}
        >
          {t('teams.createTeam')}
        </Button>
      </Stack>

      {isLoading ? (
        <LoadingSkeleton count={3} height={140} />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={GroupsOutlinedIcon}
          title={t('teams.noTeamsTitle')}
          description={t('teams.noTeamsDesc')}
          actionText={t('teams.createTeam')}
          onAction={handleOpenCreate}
        />
      ) : (
        <Grid container spacing={3}>
          {teams.map((item) => {
            const team = item.team || item;
            return (
              <Grid item xs={12} md={6} lg={4} key={team.id}>
                <Card
                  sx={{
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
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
                          flexShrink: 0,
                          border: '1px solid',
                          borderColor: (th) =>
                            th.palette.mode === 'dark'
                              ? 'rgba(99, 102, 241, 0.2)'
                              : 'rgba(36, 59, 107, 0.12)',
                        }}
                      >
                        <GroupsOutlinedIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {team.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Team #{team.id}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1 }}>
                      <Button
                        size="small"
                        startIcon={<PersonAddOutlinedIcon />}
                        variant="outlined"
                        onClick={() => {
                          setSelectedTeamId(team.id);
                          setMemberPhone('');
                          setErrorMsg('');
                          setAddMemberOpen(true);
                        }}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        {t('company.addMember')}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create Team Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('teams.createTeam')}</DialogTitle>
        <Box component="form" onSubmit={handleCreateTeam}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

              <TextField
                label={t('teams.teamName')}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                fullWidth
                size="small"
                placeholder={t('teams.teamNamePlaceholder')}
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
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setCreateOpen(false)} color="inherit">
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={isCreating}>
              {t('teams.createTeam')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('company.addMember')}</DialogTitle>
        <Box component="form" onSubmit={handleAddMember}>
          <DialogContent dividers>
            <Stack spacing={2}>
              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
              <TextField
                label={t('auth.phoneNumber')}
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                required
                fullWidth
                size="small"
                placeholder={t('auth.phonePlaceholder')}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setAddMemberOpen(false)} color="inherit">
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={isAddingMember}>
              {t('company.addMember')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
