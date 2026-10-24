import { useTranslation } from 'react-i18next';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export default function EmptyState({
  icon: Icon = InboxOutlinedIcon,
  title,
  description,
  actionText,
  onAction,
}) {
  const { t } = useTranslation();
  const finalTitle = title || t('directory.emptyInitialTitle');
  const finalDescription = description || t('directory.emptyInitialDesc');

  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: (th) =>
            th.palette.mode === 'dark'
              ? 'rgba(99, 102, 241, 0.12)'
              : 'rgba(36, 59, 107, 0.06)',
          border: '1px solid',
          borderColor: (th) =>
            th.palette.mode === 'dark'
              ? 'rgba(99, 102, 241, 0.2)'
              : 'rgba(36, 59, 107, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
          mb: 2,
        }}
      >
        <Icon sx={{ fontSize: 30 }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.75 }}>
        {finalTitle}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 440, mb: actionText ? 2.5 : 0 }}
      >
        {finalDescription}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" size="small" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
}
