import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  Paper,
} from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useGetTaskHistoryQuery } from '../../Store/servises/taskHistoryApi/index.js';
import EmptyState from '../common/EmptyState.jsx';
import LoadingSkeleton from '../common/LoadingSkeleton.jsx';
import { formatDate, formatNumber } from '../../utils/formatters.js';

export default function TaskHistoryTimeline({ taskId }) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetTaskHistoryQuery({ taskId });

  const histories = data?.data || [];

  if (isLoading) {
    return <LoadingSkeleton count={4} height={65} />;
  }

  if (histories.length === 0) {
    return (
      <EmptyState
        icon={HistoryOutlinedIcon}
        title={t('history.noHistory')}
        description={t('history.title')}
      />
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
        <HistoryOutlinedIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('history.title')} ({formatNumber(histories.length)})
        </Typography>
      </Stack>

      <Stack spacing={2} sx={{ position: 'relative', pl: 1 }}>
        {histories.map((entry, index) => {
          const dateStr = entry.createdAt ? formatDate(entry.createdAt, { hour: '2-digit', minute: '2-digit' }) : '';

          return (
            <Paper
              key={entry.id || index}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'primary.light',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar
                  src={entry.user?.avatar}
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    bgcolor: 'primary.main',
                    mt: 0.25,
                  }}
                >
                  {entry.user?.name ? entry.user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {entry.user?.name || 'Team Member'}
                    </Typography>
                    <Chip
                      label={entry.action}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        bgcolor: 'action.hover',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
                      {dateStr}
                    </Typography>
                  </Stack>

                  {/* Show previous and new values if available */}
                  {(entry.oldValue !== null || entry.newValue !== null) && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: (th) =>
                          th.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.03)'
                            : 'rgba(0, 0, 0, 0.02)',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {entry.oldValue && entry.newValue ? (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip
                            label={entry.oldValue}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.75rem', color: 'text.secondary' }}
                          />
                          <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Chip
                            label={entry.newValue}
                            size="small"
                            color="primary"
                            variant="filled"
                            sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                          />
                        </Stack>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {entry.newValue || entry.oldValue}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
