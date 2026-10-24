import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Stack,
  Chip,
  IconButton,
  Avatar,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Tooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CloseIcon from '@mui/icons-material/Close';

import {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useLeaveCompanyMutation,
  useAddOrRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} from '../../Store/servises/companyApi/index.js';
import { useAppSelector } from '../../Store/hooks.js';
import { selectCurrentUser } from '../../Store/Slice/authSlice.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import { normalizePersianDigits, formatDate } from '../../utils/formatters.js';
import { getApiErrorMessage } from '../../utils/apiError.js';

export default function CompanyPage() {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language || 'en';
  const currentUser = useAppSelector(selectCurrentUser);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('joinedAt');

  // Queries & Mutations
  const {
    data: companiesResponse,
    isLoading: isCompaniesLoading,
    error: companiesError,
  } = useGetCompaniesQuery({
    q: searchQuery.trim() || undefined,
    sort: sortBy,
  });

  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
  const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyMutation();
  const [leaveCompany, { isLoading: isLeaving }] = useLeaveCompanyMutation();
  const [addOrRemoveMember, { isLoading: isMemberMutating }] = useAddOrRemoveMemberMutation();
  const [updateMemberRole, { isLoading: isRoleUpdating }] = useUpdateMemberRoleMutation();

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [createError, setCreateError] = useState('');

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editError, setEditError] = useState('');

  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [memberPhone, setMemberPhone] = useState('');
  const [memberPhoneError, setMemberPhoneError] = useState('');

  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('MEMBER');

  // Confirm Dialogs
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [confirmRemoveMemberOpen, setConfirmRemoveMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Global Notification
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Detailed single company query
  const {
    data: singleCompanyResponse,
    isLoading: isSingleLoading,
  } = useGetCompanyByIdQuery(selectedCompanyId, {
    skip: !selectedCompanyId || !detailModalOpen,
  });

  const companiesList = companiesResponse?.data || [];
  const activeCompanyDetail = singleCompanyResponse?.data?.company;
  const activeCompanyRole = singleCompanyResponse?.data?.role;
  const activeCompanyMembers = activeCompanyDetail?.companyMembers || [];

  // Handlers
  const handleOpenCreate = () => {
    setNewCompanyName('');
    setCreateError('');
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      setCreateError(t('validation.companyNameRequired'));
      return;
    }
    if (newCompanyName.trim().length < 2 || newCompanyName.trim().length > 100) {
      setCreateError(t('validation.companyNameLength'));
      return;
    }

    try {
      await createCompany({ name: newCompanyName.trim() }).unwrap();
      setCreateDialogOpen(false);
      setFeedbackMessage({ severity: 'success', text: t('company.createdSuccess') });
    } catch (err) {
      setCreateError(getApiErrorMessage(err));
    }
  };

  const handleOpenDetail = (companyId) => {
    setSelectedCompanyId(companyId);
    setDetailModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!activeCompanyDetail) return;
    setEditCompanyName(activeCompanyDetail.name);
    setEditError('');
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editCompanyName.trim()) {
      setEditError(t('validation.companyNameRequired'));
      return;
    }
    try {
      await updateCompany({ id: selectedCompanyId, name: editCompanyName.trim() }).unwrap();
      setEditDialogOpen(false);
      setFeedbackMessage({ severity: 'success', text: t('company.updatedSuccess') });
    } catch (err) {
      setEditError(getApiErrorMessage(err));
    }
  };

  const handleDeleteCompanyConfirm = async () => {
    try {
      await deleteCompany(selectedCompanyId).unwrap();
      setConfirmDeleteOpen(false);
      setDetailModalOpen(false);
      setSelectedCompanyId(null);
      setFeedbackMessage({ severity: 'success', text: t('company.deletedSuccess') });
    } catch (err) {
      setFeedbackMessage({ severity: 'error', text: getApiErrorMessage(err) });
    }
  };

  const handleLeaveCompanyConfirm = async () => {
    try {
      await leaveCompany(selectedCompanyId).unwrap();
      setConfirmLeaveOpen(false);
      setDetailModalOpen(false);
      setSelectedCompanyId(null);
      setFeedbackMessage({ severity: 'success', text: t('company.leftSuccess') });
    } catch (err) {
      setFeedbackMessage({ severity: 'error', text: getApiErrorMessage(err) });
    }
  };

  const handleOpenAddMember = () => {
    setMemberPhone('');
    setMemberPhoneError('');
    setAddMemberDialogOpen(true);
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    const normalized = normalizePersianDigits(memberPhone.trim());
    if (!normalized) {
      setMemberPhoneError(t('validation.phoneRequired'));
      return;
    }
    if (!/^09\d{9}$/.test(normalized)) {
      setMemberPhoneError(t('validation.phoneInvalid'));
      return;
    }

    try {
      await addOrRemoveMember({ id: selectedCompanyId, phoneNumber: normalized }).unwrap();
      setAddMemberDialogOpen(false);
      setFeedbackMessage({ severity: 'success', text: t('company.memberAddedSuccess') });
    } catch (err) {
      setMemberPhoneError(getApiErrorMessage(err));
    }
  };

  const handleOpenChangeRole = (member) => {
    setSelectedMember(member);
    setSelectedNewRole(member.role || 'MEMBER');
    setChangeRoleDialogOpen(true);
  };

  const handleChangeRoleSubmit = async () => {
    if (!selectedMember) return;
    try {
      await updateMemberRole({
        id: selectedCompanyId,
        memberId: selectedMember.userId,
        role: selectedNewRole,
      }).unwrap();
      setChangeRoleDialogOpen(false);
      setFeedbackMessage({ severity: 'success', text: t('company.roleUpdatedSuccess') });
    } catch (err) {
      setFeedbackMessage({ severity: 'error', text: getApiErrorMessage(err) });
    }
  };

  const handleOpenRemoveMemberConfirm = (member) => {
    setMemberToRemove(member);
    setConfirmRemoveMemberOpen(true);
  };

  const handleRemoveMemberConfirm = async () => {
    if (!memberToRemove) return;
    try {
      await addOrRemoveMember({
        id: selectedCompanyId,
        phoneNumber: memberToRemove.user.phoneNumber,
      }).unwrap();
      setConfirmRemoveMemberOpen(false);
      setMemberToRemove(null);
      setFeedbackMessage({ severity: 'success', text: t('company.memberRemovedSuccess') });
    } catch (err) {
      setFeedbackMessage({ severity: 'error', text: getApiErrorMessage(err) });
    }
  };

  const getRoleChip = (role) => {
    if (role === 'OWNER') {
      return <Chip label={t('company.ownerRole')} color="primary" size="small" sx={{ fontWeight: 700 }} />;
    }
    if (role === 'ADMIN') {
      return <Chip label={t('company.adminRole')} color="secondary" size="small" sx={{ fontWeight: 700 }} />;
    }
    return <Chip label={t('company.memberRole')} variant="outlined" size="small" sx={{ fontWeight: 600 }} />;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6 }}>
      {/* Top Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
            {t('company.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t('company.subtitle')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddBusinessOutlinedIcon />}
          onClick={handleOpenCreate}
          sx={{ py: 1.2, px: 2.5, borderRadius: 2.5, fontWeight: 700, boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' }}
        >
          {t('company.createCompany')}
        </Button>
      </Box>

      {/* Global Alert Notification */}
      {feedbackMessage && (
        <Alert
          severity={feedbackMessage.severity}
          onClose={() => setFeedbackMessage(null)}
          sx={{ mb: 3.5, borderRadius: 2 }}
        >
          {feedbackMessage.text}
        </Alert>
      )}

      {/* Search & Sort Controls */}
      <Card sx={{ mb: 4, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8} md={9}>
              <TextField
                placeholder={t('company.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel>{t('company.sortBy')}</InputLabel>
                <Select
                  value={sortBy}
                  label={t('company.sortBy')}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="joinedAt">{t('company.sortJoined')}</MenuItem>
                  <MenuItem value="name">{t('company.sortName')}</MenuItem>
                  <MenuItem value="createdAt">{t('company.sortCreated')}</MenuItem>
                  <MenuItem value="role">{t('company.sortRole')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isCompaniesLoading && <LoadingSkeleton count={3} height={140} />}

      {/* Error State */}
      {companiesError && (
        <Alert severity="error" sx={{ mb: 3.5, borderRadius: 2 }}>
          {getApiErrorMessage(companiesError)}
        </Alert>
      )}

      {/* Empty State */}
      {!isCompaniesLoading && companiesList.length === 0 && (
        <EmptyState
          title={t('company.noCompaniesTitle')}
          description={t('company.noCompaniesDesc')}
          actionText={t('company.createCompany')}
          onAction={handleOpenCreate}
        />
      )}

      {/* Companies Grid */}
      {!isCompaniesLoading && companiesList.length > 0 && (
        <Grid container spacing={3}>
          {companiesList.map((item) => {
            const comp = item.company;
            const role = item.role;
            const memberCount = comp._count?.companyMembers || 1;
            const teamsCount = comp._count?.teams || 0;
            const projectsCount = comp._count?.projects || 0;

            return (
              <Grid item xs={12} md={6} key={comp.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: 'primary.main',
                          color: '#FFFFFF',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          borderRadius: 2,
                        }}
                      >
                        {comp.name ? comp.name.charAt(0).toUpperCase() : 'C'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {comp.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontFamily: 'monospace', display: 'block' }}
                        >
                          {comp.slug}
                        </Typography>
                      </Box>
                      {getRoleChip(role)}
                    </Stack>

                    {/* Stats counters */}
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        mb: 2.5,
                      }}
                    >
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flex: 1 }}>
                        <PeopleAltOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {t('company.memberCount', { count: memberCount })}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flex: 1 }}>
                        <GroupsOutlinedIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {t('company.teamsCount', { count: teamsCount })}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flex: 1 }}>
                        <FolderOutlinedIcon fontSize="small" sx={{ color: 'info.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {t('company.projectsCount', { count: projectsCount })}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('company.joinedAt')}: {formatDate(item.joinedAt, currentLocale)}
                      </Typography>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDetail(comp.id)}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      >
                        {t('company.manageCompany')}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* Company Management & Member Directory Modal                */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DialogTitle sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <BusinessOutlinedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {activeCompanyDetail?.name || t('company.companyDetails')}
            </Typography>
          </Stack>
          <IconButton onClick={() => setDetailModalOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {isSingleLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : activeCompanyDetail ? (
            <Stack spacing={3.5}>
              {/* Company Info Header */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25 }}>
                    {activeCompanyDetail.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', display: 'block' }}>
                    {t('company.slug')}: {activeCompanyDetail.slug}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {t('company.sortCreated')}: {formatDate(activeCompanyDetail.createdAt, currentLocale)}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ textAlign: 'end', display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('company.yourRole')}
                    </Typography>
                    {getRoleChip(activeCompanyRole)}
                  </Box>

                  {activeCompanyRole === 'OWNER' && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditOutlinedIcon />}
                      onClick={handleOpenEdit}
                      sx={{ borderRadius: 2 }}
                    >
                      {t('company.editCompany')}
                    </Button>
                  )}
                </Stack>
              </Box>

              {/* Members Section */}
              <Box>
                <Box
                  sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {t('company.members')} ({activeCompanyMembers.length})
                  </Typography>

                  {(activeCompanyRole === 'OWNER' || activeCompanyRole === 'ADMIN') && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PersonAddOutlinedIcon />}
                      onClick={handleOpenAddMember}
                      sx={{ borderRadius: 2 }}
                    >
                      {t('company.addMember')}
                    </Button>
                  )}
                </Box>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>{t('users.name')}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{t('users.phoneNumber')}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{t('company.role')}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{t('company.joinedAt')}</TableCell>
                        {(activeCompanyRole === 'OWNER' || activeCompanyRole === 'ADMIN') && (
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            {t('common.actions')}
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeCompanyMembers.map((m) => {
                        const isSelf = m.userId === currentUser?.id;
                        const canModifyRole = activeCompanyRole === 'OWNER' && !isSelf;
                        const canRemove =
                          (activeCompanyRole === 'OWNER' && !isSelf) ||
                          (activeCompanyRole === 'ADMIN' && m.role === 'MEMBER' && !isSelf);

                        return (
                          <TableRow key={m.id} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.light', fontSize: '0.75rem' }}>
                                  {m.user?.name ? m.user.name.charAt(0).toUpperCase() : 'U'}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {m.user?.name || t('directory.unnamedUser')}
                                  {isSelf && ` (${t('profile.title')})`}
                                </Typography>
                              </Stack>
                            </TableCell>

                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {m.user?.phoneNumber || '—'}
                            </TableCell>

                            <TableCell>{getRoleChip(m.role)}</TableCell>

                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                              {formatDate(m.joinedAt, currentLocale)}
                            </TableCell>

                            {(activeCompanyRole === 'OWNER' || activeCompanyRole === 'ADMIN') && (
                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  {canModifyRole && (
                                    <Tooltip title={t('company.changeRole')}>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenChangeRole(m)}
                                        sx={{ color: 'primary.main' }}
                                      >
                                        <AdminPanelSettingsOutlinedIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  {canRemove && (
                                    <Tooltip title={t('company.removeMember')}>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleOpenRemoveMemberConfirm(m)}
                                      >
                                        <DeleteOutlineOutlinedIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Stack>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Danger Actions Area */}
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {activeCompanyRole === 'OWNER' ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={() => setConfirmDeleteOpen(true)}
                  >
                    {t('company.deleteCompany')}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<ExitToAppOutlinedIcon />}
                    onClick={() => setConfirmLeaveOpen(true)}
                  >
                    {t('company.leaveCompany')}
                  </Button>
                )}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Create Company Dialog                                      */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{t('company.createCompany')}</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
              {t('company.createCompanySubtitle')}
            </Typography>

            {createError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {createError}
              </Alert>
            )}

            <TextField
              label={t('company.companyName')}
              placeholder={t('company.companyNamePlaceholder')}
              helperText={t('company.companyNameHelper')}
              value={newCompanyName}
              onChange={(e) => {
                setNewCompanyName(e.target.value);
                setCreateError('');
              }}
              autoFocus
              fullWidth
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setCreateDialogOpen(false)} color="inherit">
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={isCreating}>
              {isCreating ? t('common.saving') : t('company.createCompany')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Edit Company Name Dialog                                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{t('company.editCompany')}</DialogTitle>
        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {editError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {editError}
              </Alert>
            )}

            <TextField
              label={t('company.companyName')}
              value={editCompanyName}
              onChange={(e) => {
                setEditCompanyName(e.target.value);
                setEditError('');
              }}
              autoFocus
              fullWidth
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setEditDialogOpen(false)} color="inherit">
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={isUpdating}>
              {isUpdating ? t('common.saving') : t('common.save')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Add / Invite Member Dialog                                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog
        open={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{t('company.addMember')}</DialogTitle>
        <Box component="form" onSubmit={handleAddMemberSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
              {t('company.memberPhoneHelper')}
            </Typography>

            {memberPhoneError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {memberPhoneError}
              </Alert>
            )}

            <TextField
              label={t('company.memberPhone')}
              placeholder={t('company.memberPhonePlaceholder')}
              value={memberPhone}
              onChange={(e) => {
                setMemberPhone(e.target.value);
                setMemberPhoneError('');
              }}
              autoFocus
              fullWidth
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setAddMemberDialogOpen(false)} color="inherit">
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={isMemberMutating}>
              {isMemberMutating ? t('common.loading') : t('company.addMember')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Change Member Role Dialog                                  */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog
        open={changeRoleDialogOpen}
        onClose={() => setChangeRoleDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{t('company.changeRole')}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
            {selectedMember?.user?.name || selectedMember?.user?.phoneNumber}
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel>{t('company.role')}</InputLabel>
            <Select
              value={selectedNewRole}
              label={t('company.role')}
              onChange={(e) => setSelectedNewRole(e.target.value)}
            >
              <MenuItem value="OWNER">{t('company.ownerRole')}</MenuItem>
              <MenuItem value="ADMIN">{t('company.adminRole')}</MenuItem>
              <MenuItem value="MEMBER">{t('company.memberRole')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setChangeRoleDialogOpen(false)} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleChangeRoleSubmit} variant="contained" disabled={isRoleUpdating}>
            {isRoleUpdating ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Confirmation Modals                                        */}
      {/* ────────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title={t('company.deleteConfirmTitle')}
        content={t('company.deleteConfirmDesc', { name: activeCompanyDetail?.name })}
        confirmText={t('common.delete')}
        confirmColor="error"
        onConfirm={handleDeleteCompanyConfirm}
        onCancel={() => setConfirmDeleteOpen(false)}
        loading={isDeleting}
      />

      <ConfirmDialog
        open={confirmLeaveOpen}
        title={t('company.leaveConfirmTitle')}
        content={t('company.leaveConfirmDesc', { name: activeCompanyDetail?.name })}
        confirmText={t('company.leaveCompany')}
        confirmColor="warning"
        onConfirm={handleLeaveCompanyConfirm}
        onCancel={() => setConfirmLeaveOpen(false)}
        loading={isLeaving}
      />

      <ConfirmDialog
        open={confirmRemoveMemberOpen}
        title={t('company.removeMemberConfirmTitle')}
        content={t('company.removeMemberConfirmDesc', {
          name: memberToRemove?.user?.name || memberToRemove?.user?.phoneNumber,
          company: activeCompanyDetail?.name,
        })}
        confirmText={t('company.removeMember')}
        confirmColor="error"
        onConfirm={handleRemoveMemberConfirm}
        onCancel={() => {
          setConfirmRemoveMemberOpen(false);
          setMemberToRemove(null);
        }}
        loading={isMemberMutating}
      />
    </Box>
  );
}
