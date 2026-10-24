import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';

import { useAppDispatch, useAppSelector } from '../../Store/hooks.js';
import { selectCurrentUser, updateUserData } from '../../Store/Slice/authSlice.js';
import { useUpdateProfileMutation, useDeleteAccountMutation } from '../../Store/servises/userApi.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import EarningsSummaryCard from '../../components/earnings/EarningsSummaryCard.jsx';
import { getApiErrorMessage } from '../../utils/apiError.js';

export default function UserProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const [updateProfile, { isLoading: isUpdating, error: updateError }] = useUpdateProfileMutation();
  const [deleteAccount, { isLoading: isDeleting, error: deleteError }] = useDeleteAccountMutation();

  const [name, setName] = useState(currentUser?.name || '');
  const [preferredLocale, setPreferredLocale] = useState(currentUser?.preferredLocale || i18n.language || 'en');
  const [nameError, setNameError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const validate = () => {
    if (!name.trim()) {
      setNameError(t('validation.nameEmpty'));
      return false;
    }
    if (name.trim().length < 2 || name.trim().length > 50) {
      setNameError(t('validation.nameLength'));
      return false;
    }
    setNameError('');
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSuccessMsg('');

    try {
      const res = await updateProfile({
        name: name.trim(),
        preferredLocale,
      }).unwrap();

      // If locale changed, update i18next runtime
      if (preferredLocale !== i18n.language) {
        await i18n.changeLanguage(preferredLocale);
        localStorage.setItem('preferredLocale', preferredLocale);
      }

      dispatch(updateUserData({ name: name.trim(), preferredLocale }));
      setSuccessMsg(res.message || t('profile.updateSuccess'));
    } catch {
      // Handled by updateError state
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAccount().unwrap();
      setConfirmOpen(false);
      navigate('/login');
    } catch {
      // Handled by deleteError state
    }
  };

  const serverError = getApiErrorMessage(updateError || deleteError);

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          {t('profile.title')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.65 }}>
          {t('profile.subtitle')}
        </Typography>
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2, py: 1, px: 2 }}>
          {successMsg}
        </Alert>
      )}

      {serverError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, py: 1, px: 2 }}>
          {serverError}
        </Alert>
      )}

      {/* Profile Details Card */}
      <Card sx={{ mb: 3.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, '&:last-child': { pb: { xs: 2.5, sm: 3.5 } } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" sx={{ mb: 3.5 }}>
            <Avatar
              sx={{
                width: 76,
                height: 76,
                bgcolor: 'primary.main',
                fontSize: '1.875rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ textAlign: { xs: 'center', sm: 'start' } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                {currentUser?.name || t('directory.unnamedUser')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {t('profile.phoneLabel')}: {currentUser?.phoneNumber}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                {t('directory.tableId')}: #{currentUser?.id}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3.5 }} />

          <Box component="form" onSubmit={handleUpdate} noValidate>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: 'text.primary' }}>
              {t('profile.editDisplayName')}
            </Typography>

            <Stack spacing={3}>
              <TextField
                label={t('profile.fullNameLabel')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                error={Boolean(nameError)}
                helperText={nameError || t('validation.nameLength')}
                disabled={isUpdating}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={t('profile.phoneLabel')}
                value={currentUser?.phoneNumber || ''}
                disabled
                helperText={t('profile.phoneHelper')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Language Preference Selector */}
              <FormControl fullWidth size="small">
                <InputLabel id="preferred-language-label">
                  {t('profile.preferredLanguage')}
                </InputLabel>
                <Select
                  labelId="preferred-language-label"
                  value={preferredLocale}
                  label={t('profile.preferredLanguage')}
                  onChange={(e) => setPreferredLocale(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <TranslateOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="en">English (English)</MenuItem>
                  <MenuItem value="fa">فارسی (Persian)</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isUpdating}
                  startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
                  sx={{ px: 3.5, py: 1.2 }}
                >
                  {isUpdating ? t('profile.saving') : t('profile.saveChanges')}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Time & Earnings Summary Card */}
      <EarningsSummaryCard />

      {/* Danger Zone Card */}
      <Card
        sx={{
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'error.light',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, '&:last-child': { pb: { xs: 2.5, sm: 3.5 } } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'error.main', mb: 1 }}>
            {t('profile.dangerZone')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.65 }}>
            {t('profile.dangerDesc')}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting}
            sx={{ px: 2.5, py: 1 }}
          >
            {t('profile.deleteAccount')}
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={t('profile.deleteConfirmTitle')}
        content={t('profile.deleteConfirmContent')}
        confirmText={t('profile.deleteConfirmButton')}
        cancelText={t('common.cancel')}
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmOpen(false)}
      />
    </Box>
  );
}
