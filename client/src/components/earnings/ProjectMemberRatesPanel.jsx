import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from '@mui/material';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import {
  useGetProjectMemberRatesQuery,
  useSetProjectMemberRateMutation,
  useDeleteProjectMemberRateMutation,
} from '../../Store/servises/timeTrackingApi/index.js';

function formatMoney(cents, currency = 'USD') {
  if (cents === null || cents === undefined) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

/**
 * Dedicated section in project earnings/rate settings.
 * Allows company owner or project creator to choose/change rates per member.
 */
export default function ProjectMemberRatesPanel({ projectId, isAdmin = false }) {
  const { t } = useTranslation();
  const [selectedMember, setSelectedMember] = useState(null);
  const [rateInput, setRateInput] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [successFeedback, setSuccessFeedback] = useState('');

  const { data, isLoading, isError } = useGetProjectMemberRatesQuery(projectId, {
    skip: !projectId,
  });

  const [setMemberRate, { isLoading: isSaving }] = useSetProjectMemberRateMutation();
  const [deleteMemberRate, { isLoading: isDeleting }] = useDeleteProjectMemberRateMutation();

  const ratesData = data?.data;
  const members = ratesData?.members || [];
  const currency = ratesData?.currency || 'USD';
  const canManageRate =
    ratesData?.canManageRate !== undefined
      ? Boolean(ratesData.canManageRate)
      : Boolean(isAdmin);
  const customCount = members.filter((m) => m.hasCustomRate).length;

  const handleOpenEdit = (member) => {
    setSelectedMember(member);
    setRateInput(
      member.customHourlyRateCents !== null
        ? String(member.customHourlyRateCents / 100)
        : ratesData?.projectHourlyRateCents !== null
        ? String(ratesData.projectHourlyRateCents / 100)
        : ''
    );
    setDialogError('');
  };

  const handleCloseDialog = () => {
    setSelectedMember(null);
    setRateInput('');
    setDialogError('');
  };

  const handleSaveRate = async () => {
    if (!selectedMember) return;
    setDialogError('');

    const parsed = parseFloat(rateInput);
    if (rateInput !== '' && (isNaN(parsed) || parsed < 0)) {
      setDialogError(t('earnings.invalidRate', 'Please enter a valid non-negative hourly rate.'));
      return;
    }

    const hourlyRateCents = rateInput === '' ? null : Math.round(parsed * 100);

    try {
      await setMemberRate({
        projectId,
        targetUserId: selectedMember.userId,
        hourlyRateCents,
      }).unwrap();

      setSuccessFeedback(t('earnings.memberRateSaved', 'Member custom rate saved successfully.'));
      handleCloseDialog();
    } catch (err) {
      setDialogError(err?.data?.message || t('earnings.rateSaveError', 'Failed to save rate.'));
    }
  };

  const handleResetToDefault = async (member) => {
    try {
      await deleteMemberRate({
        projectId,
        targetUserId: member.userId,
      }).unwrap();

      setSuccessFeedback(
        t('earnings.memberRateRemoved', 'Member custom rate removed. Reverted to project default.')
      );
      if (selectedMember?.userId === member.userId) {
        handleCloseDialog();
      }
    } catch (err) {
      setDialogError(err?.data?.message || 'Failed to remove custom rate');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        {t('earnings.memberRatesError', 'Unable to load team member rates at this time.')}
      </Alert>
    );
  }

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <GroupOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {t('earnings.memberRatesTitle', 'Team Member Rates')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t(
                  'earnings.memberRatesDesc',
                  'Configure individual hourly rates for team members. If unset, the project default rate applies.'
                )}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {customCount > 0 && (
              <Chip
                label={t('earnings.customRatesCount', { count: customCount })}
                color="secondary"
                size="small"
                sx={{ height: 24, fontSize: '0.75rem', fontWeight: 700 }}
              />
            )}
            {!canManageRate && (
              <Tooltip title={t('earnings.ownerOrCreatorOnly')} arrow>
                <Chip
                  icon={<InfoOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                  label={t('common.details', 'Read Only')}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24, fontSize: '0.72rem' }}
                />
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {successFeedback && (
          <Alert
            severity="success"
            onClose={() => setSuccessFeedback('')}
            sx={{ mb: 2.5, borderRadius: 2 }}
          >
            {successFeedback}
          </Alert>
        )}

        {/* Member list / Table */}
        {members.length === 0 ? (
          <Box
            sx={{
              py: 3,
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('earnings.noMembersInProject', 'No members found for this project.')}
            </Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', py: 1.25 }}>
                    {t('earnings.member', 'Member')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', py: 1.25 }}>
                    {t('earnings.hourlyRateLabel', 'Rate')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', py: 1.25 }}>
                    {t('tasks.status', 'Rate Type')}
                  </TableCell>
                  {canManageRate && (
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', py: 1.25 }}>
                      {t('directory.tableActions', 'Actions')}
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.userId} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.25 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar
                          src={m.avatar}
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.main',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {m.name || t('directory.unnamedUser', 'Unnamed User')}
                          </Typography>
                          {m.phoneNumber && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                              {m.phoneNumber}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: 1.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {formatMoney(m.effectiveHourlyRateCents, currency)}
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                          / hr
                        </Typography>
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.25 }}>
                      {m.hasCustomRate ? (
                        <Chip
                          icon={<AttachMoneyOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                          label={t('earnings.customRate', 'Custom Rate')}
                          size="small"
                          color="secondary"
                          sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 700 }}
                        />
                      ) : (
                        <Chip
                          label={t('earnings.defaultRate', 'Project Default')}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
                        />
                      )}
                    </TableCell>

                    {canManageRate && (
                      <TableCell align="center" sx={{ py: 1.25 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                          <Tooltip title={t('earnings.editCustomRate', 'Edit Member Rate')}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEdit(m)}
                              sx={{ p: 0.75 }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {m.hasCustomRate && (
                            <Tooltip title={t('earnings.removeCustomRate', 'Reset to Default')}>
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleResetToDefault(m)}
                                disabled={isDeleting}
                                sx={{ p: 0.75 }}
                              >
                                <RestartAltOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {/* Edit Rate Dialog */}
      <Dialog
        open={Boolean(selectedMember)}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ p: 2.5, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <AttachMoneyOutlinedIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('earnings.editCustomRate', 'Edit Member Rate')}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={handleCloseDialog}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, pt: 1 }}>
          {selectedMember && (
            <Stack spacing={2.5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 700 }}>
                  {selectedMember.name ? selectedMember.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {selectedMember.name || t('directory.unnamedUser', 'Unnamed User')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('earnings.defaultRate')}: {formatMoney(ratesData?.projectHourlyRateCents, currency)}/hr
                  </Typography>
                </Box>
              </Box>

              {dialogError && (
                <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                  {dialogError}
                </Alert>
              )}

              <TextField
                label={t('earnings.hourlyRateLabel', 'Hourly Rate')}
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                size="small"
                fullWidth
                autoFocus
                placeholder="e.g. 75.00"
                helperText={t(
                  'earnings.rateHelper',
                  'Leave blank or clear to revert to project default rate'
                )}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        {currency}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1, display: 'flex', justifyContent: 'space-between' }}>
          {selectedMember?.hasCustomRate ? (
            <Button
              size="small"
              color="error"
              onClick={() => handleResetToDefault(selectedMember)}
              disabled={isSaving || isDeleting}
              startIcon={<RestartAltOutlinedIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {t('earnings.removeCustomRate', 'Reset to Default')}
            </Button>
          ) : (
            <Box />
          )}

          <Stack direction="row" spacing={1}>
            <Button onClick={handleCloseDialog} color="inherit" disabled={isSaving} sx={{ borderRadius: 2 }}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveRate}
              disabled={isSaving}
              startIcon={isSaving && <CircularProgress size={14} color="inherit" />}
              sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
            >
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
