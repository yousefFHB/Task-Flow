import { useTranslation } from 'react-i18next';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getApiErrorMessage } from '../../utils/apiError.js';

export default function ErrorMessage({
  title,
  message,
  onRetry,
  sx = {},
}) {
  const { t } = useTranslation();
  const finalTitle = title || t('common.networkError');
  const displayMsg = typeof message === 'string' ? message : getApiErrorMessage(message);

  return (
    <Box sx={{ width: '100%', my: 2, ...sx }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
            >
              {t('common.retry')}
            </Button>
          ) : undefined
        }
      >
        <AlertTitle sx={{ fontWeight: 600 }}>{finalTitle}</AlertTitle>
        {displayMsg}
      </Alert>
    </Box>
  );
}
