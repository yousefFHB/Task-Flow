import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Box,
} from '@mui/material';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';

import { useAppDispatch, useAppSelector } from '../../Store/hooks.js';
import { selectCurrentUser, updateUserData } from '../../Store/Slice/authSlice.js';
import { useUpdateProfileMutation } from '../../Store/servises/userApi.js';

const LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'fa', label: 'Persian', nativeName: 'فارسی', dir: 'rtl' },
];

export default function LanguageSwitcher({ size = 'small', variant = 'outlined' }) {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [anchorEl, setAnchorEl] = useState(null);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const [updateProfile] = useUpdateProfileMutation();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (newLang) => {
    handleClose();
    if (newLang === currentLang) return;

    // Change i18next language immediately
    await i18n.changeLanguage(newLang);
    localStorage.setItem('preferredLocale', newLang);

    // If user is authenticated, sync with backend database
    if (currentUser) {
      dispatch(updateUserData({ preferredLocale: newLang }));
      try {
        await updateProfile({ preferredLocale: newLang }).unwrap();
      } catch {
        // Silently preserve local preference even if network fails
      }
    }
  };

  const activeLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Button
        onClick={handleOpen}
        size={size}
        variant={variant}
        color="inherit"
        startIcon={<TranslateOutlinedIcon sx={{ fontSize: 18 }} />}
        sx={{
          borderRadius: 2,
          px: 1.5,
          py: 0.6,
          borderColor: 'divider',
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          color: 'text.secondary',
          '&:hover': {
            borderColor: 'primary.main',
            color: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        {activeLangObj.nativeName}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{
          horizontal: i18n.language === 'fa' ? 'left' : 'right',
          vertical: 'top',
        }}
        anchorOrigin={{
          horizontal: i18n.language === 'fa' ? 'left' : 'right',
          vertical: 'bottom',
        }}
        PaperProps={{
          sx: {
            minWidth: 160,
            mt: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        {LANGUAGES.map((lang) => {
          const isSelected = lang.code === currentLang;
          return (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              selected={isSelected}
              sx={{
                py: 1,
                px: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                  {lang.nativeName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t(`common.${lang.code === 'en' ? 'english' : 'persian'}`)}
                </Typography>
              </Box>

              {isSelected && (
                <ListItemIcon sx={{ minWidth: 'auto', color: 'primary.main', ml: 1.5 }}>
                  <CheckOutlinedIcon fontSize="small" />
                </ListItemIcon>
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
