import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
  Paper,
  Chip,
  alpha,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useLoginMutation } from '../../Store/servises/authApi.js';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { normalizePersianDigits } from '../../utils/formatters.js';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isSessionExpired = Boolean(location.state?.sessionExpired);
  const [login, { isLoading, error }] = useLoginMutation();

  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    const normalizedPhone = normalizePersianDigits(formData.phoneNumber.trim());
    const phoneRegex = /^09\d{9}$/;

    if (!normalizedPhone) {
      errors.phoneNumber = t('validation.phoneRequired');
    } else if (!phoneRegex.test(normalizedPhone)) {
      errors.phoneNumber = t('validation.phoneInvalid');
    }

    if (!formData.password) {
      errors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 6) {
      errors.password = t('validation.passwordLength');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'phoneNumber' ? normalizePersianDigits(value) : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login({
        phoneNumber: normalizePersianDigits(formData.phoneNumber.trim()),
        password: formData.password,
      }).unwrap();
      navigate('/');
    } catch {
      // Error handled by RTK Query hook and getApiErrorMessage
    }
  };

  const handleDemoLogin = async (demoPhone = '09121111111', demoPass = 'Password123!') => {
    setFormData({ phoneNumber: demoPhone, password: demoPass });
    setFormErrors({});
    try {
      await login({
        phoneNumber: demoPhone,
        password: demoPass,
      }).unwrap();
      navigate('/');
    } catch {
      // Error handled by RTK Query hook and getApiErrorMessage
    }
  };

  const serverErrorMessage = getApiErrorMessage(error);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
          {t('auth.welcomeBack')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('auth.loginSubtitle')}
        </Typography>
      </Box>

      {/* ─── Instant Demo Access Card ────────────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          borderStyle: 'dashed',
          borderColor: 'primary.main',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        }}
      >
        <Stack spacing={1.25}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              ⚡ {t('auth.demoTitle', 'Demo Account (Instant Access)')}
            </Typography>
            <Chip
              label={t('auth.demoBadge', 'No Signup Needed')}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            {t('auth.demoSubtitle', 'Evaluate all features immediately without waiting for SMS verification:')}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1.25,
              p: 1.25,
              borderRadius: 2,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                📱 09121111111
              </Typography>
              <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                🔑 Password123!
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleDemoLogin('09121111111', 'Password123!')}
              disabled={isLoading}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'none',
                px: 1.5,
                py: 0.6,
                borderRadius: 1.5,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(36, 59, 107, 0.25)',
              }}
            >
              🚀 {t('auth.demoLoginBtn', '1-Click Demo Login')}
            </Button>
          </Box>
        </Stack>
      </Paper>

      {isSessionExpired && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          {t('auth.sessionExpired')}
        </Alert>
      )}

      {serverErrorMessage && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {serverErrorMessage}
        </Alert>
      )}

      <Stack spacing={2.5}>
        <TextField
          label={t('auth.phoneNumber')}
          name="phoneNumber"
          placeholder={t('auth.phonePlaceholder')}
          value={formData.phoneNumber}
          onChange={handleChange}
          error={Boolean(formErrors.phoneNumber)}
          helperText={formErrors.phoneNumber}
          disabled={isLoading}
          autoComplete="tel"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIphoneOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label={t('auth.password')}
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          error={Boolean(formErrors.password)}
          helperText={formErrors.password}
          disabled={isLoading}
          autoComplete="current-password"
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="caption"
            sx={{ fontWeight: 600, color: 'secondary.main', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('auth.forgotPassword')}
          </Link>
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoading}
          sx={{
            py: 1.25,
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(36, 59, 107, 0.3)',
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : t('auth.signIn')}
        </Button>
      </Stack>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('auth.dontHaveAccount')}{' '}
          <Link
            component={RouterLink}
            to="/register"
            sx={{ fontWeight: 600, color: 'secondary.main', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('auth.createAccount')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
