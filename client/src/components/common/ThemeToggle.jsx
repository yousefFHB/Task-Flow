import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip, Box } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

import { useAppDispatch, useAppSelector } from '../../Store/hooks.js';
import { selectThemeMode, toggleThemeMode } from '../../Store/Slice/themeSlice.js';

export default function ThemeToggle({ size = 'medium', sx = {} }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  const isDark = mode === 'dark';

  const tooltipTitle = isDark ? t('common.switchToLight') : t('common.switchToDark');

  const handleToggle = () => {
    dispatch(toggleThemeMode());
  };

  return (
    <Tooltip title={tooltipTitle} arrow>
      <IconButton
        onClick={handleToggle}
        aria-label={tooltipTitle}
        size={size}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'primary.main',
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)',
          }}
        >
          {isDark ? (
            <LightModeOutlinedIcon
              fontSize={size === 'small' ? 'small' : 'medium'}
              sx={{ color: '#FBBF24' }} // Warm sun gold
            />
          ) : (
            <DarkModeOutlinedIcon
              fontSize={size === 'small' ? 'small' : 'medium'}
              sx={{ color: '#4F46E5' }} // Vibrant indigo moon
            />
          )}
        </Box>
      </IconButton>
    </Tooltip>
  );
}
