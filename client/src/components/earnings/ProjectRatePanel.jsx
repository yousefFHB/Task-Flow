import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Chip,
  Divider,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import {
  useGetProjectRateQuery,
  useSetProjectRateMutation,
} from '../../Store/servises/timeTrackingApi/index.js';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'IRR', 'AED', 'CAD', 'AUD'];

/** Admin-only panel embedded into a project settings/detail section.
 *  Props:
 *   - projectId: number (required)
 *   - isAdmin: boolean — when false, renders a read-only display
 */
export default function ProjectRatePanel({ projectId, isAdmin = false }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [rateInput, setRateInput] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading } = useGetProjectRateQuery(projectId, { skip: !projectId });
  const [setProjectRate, { isLoading: isSaving }] = useSetProjectRateMutation();

  const rateData = data?.data;
  const canManage = rateData?.canManageRate !== undefined ? rateData.canManageRate : isAdmin;

  // Populate form from fetched data when entering edit mode
  useEffect(() => {
    if (editing && rateData) {
      setRateInput(
        rateData.hourlyRateCents !== null
          ? String(rateData.hourlyRateCents / 100)
          : ''
      );
      setCurrency(rateData.currency || 'USD');
    }
  }, [editing, rateData]);

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    // Parse rate to cents
    const rateFloat = parseFloat(rateInput);
    if (rateInput !== '' && (isNaN(rateFloat) || rateFloat < 0)) {
      setErrorMsg(t('earnings.invalidRate', 'Please enter a valid non-negative hourly rate.'));
      return;
    }

    const hourlyRateCents =
      rateInput === '' ? null : Math.round(rateFloat * 100);

    try {
      await setProjectRate({ projectId, hourlyRateCents, currency }).unwrap();
      setSuccessMsg(
        t(
          'earnings.rateSaved',
          'Hourly rate updated. Previously logged entries are unaffected.'
        )
      );
      setEditing(false);
    } catch (err) {
      setErrorMsg(err?.data?.message || t('earnings.rateSaveError', 'Failed to save rate.'));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'warning.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AttachMoneyOutlinedIcon sx={{ fontSize: 22, color: '#fff' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {t('earnings.hourlyRate', 'Project Hourly Rate')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {canManage
                ? t('earnings.rateAdminDesc', 'Set the rate used to calculate member earnings')
                : t('earnings.ownerOrCreatorOnly', 'Only the company owner or project creator can change pay rates.')}
            </Typography>
          </Box>
          <Tooltip
            title={t(
              'earnings.snapshotNote',
              'The rate is snapshotted when a time entry is created. Changing the rate here will NOT retroactively change earnings for past entries.'
            )}
            arrow
          >
            <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled', cursor: 'help' }} />
          </Tooltip>
        </Stack>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 1.5 }}>
            {successMsg}
          </Alert>
        )}
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
            {errorMsg}
          </Alert>
        )}

        {!editing ? (
          /* ── Read-only display ── */
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              {rateData?.hourlyRateCents !== null && rateData?.hourlyRateCents !== undefined ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: rateData.currency || 'USD',
                    }).format(rateData.hourlyRateCents / 100)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    / hr
                  </Typography>
                  <Chip
                    label={rateData.currency || 'USD'}
                    size="small"
                    sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
                  />
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                  {t('earnings.noRateSet', 'No hourly rate configured')}
                </Typography>
              )}
            </Box>

            {canManage && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                onClick={() => {
                  setSuccessMsg('');
                  setErrorMsg('');
                  setEditing(true);
                }}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {t('earnings.editRate', 'Edit Rate')}
              </Button>
            )}
          </Stack>
        ) : (
          /* ── Edit form (admin only) ── */
          <>
            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                label={t('earnings.hourlyRateLabel', 'Hourly Rate')}
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                size="small"
                sx={{ flex: 1 }}
                placeholder="e.g. 50.00"
                helperText={t('earnings.rateHelper', 'Leave blank to remove the rate')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                label={t('earnings.currency', 'Currency')}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                size="small"
                startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon />}
                onClick={handleSave}
                disabled={isSaving}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isSaving ? t('common.saving') : t('common.save', 'Save Rate')}
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={() => setEditing(false)}
                disabled={isSaving}
                sx={{ textTransform: 'none' }}
              >
                {t('common.cancel')}
              </Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
