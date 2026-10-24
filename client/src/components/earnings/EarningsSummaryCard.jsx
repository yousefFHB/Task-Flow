import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useGetMyEarningsSummaryQuery } from '../../Store/servises/timeTrackingApi/index.js';
import { formatDuration, formatDate } from '../../utils/formatters.js';

/** Formats cents to a readable currency string, e.g. 5000 → "$50.00" */
function formatMoney(cents, currency = 'USD') {
  if (cents === null || cents === undefined) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

const DATE_PRESETS = [
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_30', label: 'Last 30 Days' },
  { value: 'this_year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
  { value: 'all', label: 'All Time' },
];

function getDateRange(preset, customStart, customEnd) {
  const now = new Date();
  switch (preset) {
    case 'this_week': {
      const day = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
    }
    case 'last_30': {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return { startDate: start.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
    }
    case 'this_year': {
      return { startDate: `${now.getFullYear()}-01-01`, endDate: now.toISOString().split('T')[0] };
    }
    case 'custom':
      return { startDate: customStart || undefined, endDate: customEnd || undefined };
    case 'all':
    default:
      return {};
  }
}

export default function EarningsSummaryCard() {
  const { t } = useTranslation();
  const [preset, setPreset] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const queryParams = useMemo(() => {
    const range = getDateRange(preset, customStart, customEnd);
    return Object.fromEntries(Object.entries(range).filter(([, v]) => v));
  }, [preset, customStart, customEnd]);

  const { data, isLoading, isError } = useGetMyEarningsSummaryQuery(queryParams);
  const summary = data?.data;

  return (
    <Card sx={{ mb: 3.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, '&:last-child': { pb: { xs: 2.5, sm: 3.5 } } }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AttachMoneyOutlinedIcon sx={{ fontSize: 22, color: '#fff' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {t('earnings.title', 'Time & Earnings Summary')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('earnings.subtitle', 'Your logged hours and calculated earnings')}
            </Typography>
          </Box>
          <Tooltip
            title={t(
              'earnings.rateNote',
              'Earnings are calculated based on the hourly rate set by your project admin at the time each entry was logged. Rate changes do not affect past entries.'
            )}
            arrow
          >
            <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled', ml: 'auto !important', cursor: 'help' }} />
          </Tooltip>
        </Stack>

        {/* Date filter */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }} alignItems={{ sm: 'center' }}>
          <TextField
            select
            size="small"
            label={t('earnings.period', 'Period')}
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 190 } }}
            InputProps={{
              startAdornment: (
                <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.75 }} />
              ),
            }}
          >
            {DATE_PRESETS.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </TextField>

          {preset === 'custom' && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' }, flex: 1 }}>
              <TextField
                size="small"
                type="date"
                label={t('earnings.from', 'From')}
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}
              />
              <TextField
                size="small"
                type="date"
                label={t('earnings.to', 'To')}
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}
              />
            </Stack>
          )}
        </Stack>

        {/* Body */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {t('earnings.fetchError', 'Failed to load earnings summary.')}
          </Alert>
        ) : !summary || summary.entryCount === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <AccessTimeOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {t('earnings.noData', 'No time entries logged in the selected period.')}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Totals row */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <StatPill
                icon={<AccessTimeOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
                label={t('earnings.totalHours', 'Total Hours')}
                value={formatDuration(summary.totalMinutes)}
                color="primary.main"
              />
              <StatPill
                icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 20, color: 'success.main' }} />}
                label={t('earnings.totalEarnings', 'Total Earnings')}
                value={
                  summary.totalEarningsCents !== null
                    ? formatMoney(summary.totalEarningsCents)
                    : t('earnings.noRate', 'No rate set')
                }
                color="success.main"
                faded={summary.totalEarningsCents === null}
              />
            </Stack>

            {/* Per-project breakdown */}
            {summary.byProject && summary.byProject.length > 0 && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {t('earnings.byProject', 'By Project')}
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {summary.byProject.map((proj) => (
                    <Box
                      key={proj.projectId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        px: 2,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <FolderOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, color: 'text.primary', minWidth: 0 }}>
                        {proj.projectName}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                        <Chip
                          label={formatDuration(proj.totalMinutes)}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            bgcolor: 'primary.main',
                            color: '#fff',
                          }}
                        />
                        {proj.totalEarningsCents !== null ? (
                          <Chip
                            label={formatMoney(proj.totalEarningsCents, proj.currency)}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              bgcolor: 'success.main',
                              color: '#fff',
                            }}
                          />
                        ) : (
                          <Chip
                            label={t('earnings.noRate', 'No rate')}
                            size="small"
                            variant="outlined"
                            sx={{ height: 24, fontSize: '0.72rem', color: 'text.disabled' }}
                          />
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatPill({ icon, label, value, color, faded }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 1.75,
          bgcolor: `${color}1A`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2, mb: 0.25 }}>
          {label}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: faded ? 'text.disabled' : color,
            lineHeight: 1.2,
            fontSize: '1.2rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
