import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Stack,
  LinearProgress,
  Chip,
  Paper,
} from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { formatDuration, formatNumber } from '../../utils/formatters.js';

export default function TaskTimeSummaryCard({
  totalLoggedMinutes = 0,
  estimatedMinutes = null,
  storyPoints = null,
}) {
  const { t } = useTranslation();
  const hasEstimate = estimatedMinutes !== null && estimatedMinutes > 0;
  const progressPercent = hasEstimate
    ? Math.min(100, Math.round((totalLoggedMinutes / estimatedMinutes) * 100))
    : 0;

  const isOverEstimate = hasEstimate && totalLoggedMinutes > estimatedMinutes;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: (th) =>
          th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t('timeTracking.title')}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {storyPoints !== null && storyPoints !== undefined && (
              <Chip
                label={`${formatNumber(storyPoints)} SP`}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
              />
            )}
            {isOverEstimate && (
              <Chip
                icon={<WarningAmberOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                label={t('timeTracking.overEstimate')}
                size="small"
                color="warning"
                sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
              />
            )}
            {hasEstimate && !isOverEstimate && totalLoggedMinutes > 0 && (
              <Chip
                icon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important' }} />}
                label={t('timeTracking.progress')}
                size="small"
                color="success"
                sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
              />
            )}
          </Stack>
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {formatDuration(totalLoggedMinutes)}{' '}
              <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                {t('timeTracking.logged')}
              </Typography>
            </Typography>
            {hasEstimate ? (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {formatDuration(estimatedMinutes)} {t('timeTracking.estimated')} ({formatNumber(progressPercent)}%)
              </Typography>
            ) : null}
          </Stack>

          {hasEstimate && (
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              color={isOverEstimate ? 'error' : progressPercent > 80 ? 'warning' : 'primary'}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'action.hover',
              }}
            />
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
