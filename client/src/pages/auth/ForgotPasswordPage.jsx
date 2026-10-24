import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';

import { useForgetPasswordMutation, useResendCodeMutation } from '../../Store/servises/authApi.js';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { normalizePersianDigits } from '../../utils/formatters.js';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [forgetPassword, { isLoading: isResetting, error: resetError }] = useForgetPasswordMutation();
  const [resendCode, { isLoading: isSendingCode, error: resendError }] = useResendCodeMutation();

  const [codeSent, setCodeSent] = useState(false);
  const [codeSuccessMsg, setCodeSuccessMsg] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    code: '',
    newPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const validatePhone = () => {
    const normalizedPhone = normalizePersianDigits(formData.phoneNumber.trim());
    const phoneRegex = /^09\d{9}$/;
    if (!normalizedPhone) {
      setFormErrors((prev) => ({ ...prev, phoneNumber: t('validation.phoneRequired') }));
      return false;
    }
    if (!phoneRegex.test(normalizedPhone)) {
      setFormErrors((prev) => ({
        ...prev,
        phoneNumber: t('validation.phoneInvalid'),
      }));
      return false;
    }
    return true;
  };

  const validateFull = () => {
    const errors = {};
    if (!validatePhone()) {
      errors.phoneNumber = formErrors.phoneNumber || t('validation.phoneInvalid');
    }
    const normalizedCode = normalizePersianDigits(formData.code.trim());
    if (!normalizedCode) {
      errors.code = t('validation.codeRequired');
    } else if (normalizedCode.length < 4 || normalizedCode.length > 6) {
      errors.code = t('validation.codeLength');
    }
    if (!formData.newPassword) {
      errors.newPassword = t('validation.passwordRequired');
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = t('validation.passwordLength');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'phoneNumber' || name === 'code' ? normalizePersianDigits(value) : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSendCode = async () => {
    if (!validatePhone()) return;
    try {
      const res = await resendCode({ phoneNumber: normalizePersianDigits(formData.phoneNumber.trim()) }).unwrap();
      setCodeSent(true);
      setCodeSuccessMsg(res.message || t('auth.codeSentSuccess'));
    } catch {
      // Error handled by hook state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFull()) return;

    try {
      await forgetPassword({
        phoneNumber: normalizePersianDigits(formData.phoneNumber.trim()),
        code: normalizePersianDigits(formData.code.trim()),
        newPassword: formData.newPassword,
      }).unwrap();
      setResetSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch {
      // Error handled by hook state
    }
  };

  const serverErrorMessage = getApiErrorMessage(resetError || resendError);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
          {t('auth.resetPassword')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('auth.resetSubtitle')}
        </Typography>
      </Box>

      {serverErrorMessage && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {serverErrorMessage}
        </Alert>
      )}

      {codeSuccessMsg && !resetSuccess && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
          {codeSuccessMsg}
        </Alert>
      )}

      {resetSuccess && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
          {t('auth.resetSuccessMessage')}
        </Alert>
      )}

      <Stack spacing={2.5}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label={t('auth.phoneNumber')}
            name="phoneNumber"
            placeholder={t('auth.phonePlaceholder')}
            value={formData.phoneNumber}
            onChange={handleChange}
            error={Boolean(formErrors.phoneNumber)}
            helperText={formErrors.phoneNumber}
            disabled={isResetting || isSendingCode}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIphoneOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            onClick={handleSendCode}
            disabled={isSendingCode || isResetting}
            sx={{
              whiteSpace: 'nowrap',
              px: 2,
              minWidth: 110,
              height: 40,
              alignSelf: formErrors.phoneNumber ? 'flex-start' : 'center',
            }}
          >
            {isSendingCode ? (
              <CircularProgress size={18} color="inherit" />
            ) : codeSent ? (
              t('auth.resendCode')
            ) : (
              t('auth.getCode')
            )}
          </Button>
        </Box>

        <TextField
          label={t('auth.verificationCode')}
          name="code"
          placeholder={t('auth.codePlaceholder')}
          value={formData.code}
          onChange={handleChange}
          error={Boolean(formErrors.code)}
          helperText={formErrors.code || (codeSent ? t('auth.codeHelper') : '')}
          disabled={isResetting}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <KeyOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label={t('auth.newPassword')}
          name="newPassword"
          type={showPassword ? 'text' : 'password'}
          value={formData.newPassword}
          onChange={handleChange}
          error={Boolean(formErrors.newPassword)}
          helperText={formErrors.newPassword || t('auth.passwordMinLength')}
          disabled={isResetting}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isResetting || resetSuccess}
          sx={{
            py: 1.25,
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(36, 59, 107, 0.3)',
          }}
        >
          {isResetting ? <CircularProgress size={24} color="inherit" /> : t('auth.submitReset')}
        </Button>
      </Stack>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          <Link
            component={RouterLink}
            to="/login"
            sx={{ fontWeight: 600, color: 'secondary.main', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('auth.backToLogin')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
