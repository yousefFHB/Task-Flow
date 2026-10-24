import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';

import { useGetProjectEarningsReportQuery } from '../../Store/servises/timeTrackingApi/index.js';
import { formatDuration } from '../../utils/formatters.js';

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
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      };
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      };
    }
    case 'last_30': {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      };
    }
    case 'this_year':
      return {
        startDate: `${now.getFullYear()}-01-01`,
        endDate: now.toISOString().split('T')[0],
      };
    case 'custom':
      return {
        startDate: customStart || undefined,
        endDate: customEnd || undefined,
      };
    default:
      return {};
  }
}

/**
 * Admin-only project earnings report.
 * Props:
 *  - projectId: number (required)
 */
export default function ProjectEarningsReport({ projectId }) {
  const { t } = useTranslation();
  const [preset, setPreset] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const queryArgs = useMemo(() => {
    const range = getDateRange(preset, customStart, customEnd);
    return {
      projectId,
      ...Object.fromEntries(Object.entries(range).filter(([, v]) => v)),
    };
  }, [projectId, preset, customStart, customEnd]);

  const { data, isLoading, isError } = useGetProjectEarningsReportQuery(queryArgs, {
    skip: !projectId,
  });
  const report = data?.data;

  return (
    <Card sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'info.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AssessmentOutlinedIcon sx={{ fontSize: 22, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {t('earnings.teamReport', 'Team Earnings Report')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('earnings.teamReportDesc', 'Per-member hours and calculated earnings')}
            </Typography>
          </Box>
        </Stack>

        {/* Date filter row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
          <TextField
            select
            size="small"
            label={t('earnings.period', 'Period')}
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            sx={{ minWidth: 170 }}
            InputProps={{
              startAdornment: (
                <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary', mr: 0.75 }} />
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
            <>
              <TextField
                size="small"
                type="date"
                label={t('earnings.from', 'From')}
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 145 }}
              />
              <TextField
                size="small"
                type="date"
                label={t('earnings.to', 'To')}
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 145 }}
              />
            </>
          )}
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ borderRadius: 1.5 }}>
            {t('earnings.fetchError', 'Failed to load earnings report.')}
          </Alert>
        ) : !report || report.entryCount === 0 ? (
          <Box
            sx={{
              py: 4,
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <AccessTimeOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {t('earnings.noData', 'No time entries in the selected period.')}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Project totals */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
              <SummaryChip
                icon={<AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />}
                label={t('earnings.totalHours', 'Total Hours')}
                value={formatDuration(report.totalMinutes)}
                color="primary"
              />
              <SummaryChip
                icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 16 }} />}
                label={t('earnings.totalEarnings', 'Total Earnings')}
                value={
                  report.totalEarningsCents !== null
                    ? formatMoney(report.totalEarningsCents, report.currency)
                    : t('earnings.noRate', 'No rate')
                }
                color="success"
                faded={report.totalEarningsCents === null}
              />
            </Stack>

            {/* Current rate badge */}
            {report.currentHourlyRateCents !== null && (
              <Chip
                icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 14 }} />}
                label={`${t('earnings.currentRate', 'Current Rate')}: ${formatMoney(report.currentHourlyRateCents, report.currency)}/hr`}
                size="small"
                sx={{ mb: 2, fontWeight: 600 }}
                color="warning"
              />
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Per-member table */}
            <TableContainer
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', textTransform: 'uppercase', py: 1.25 }}>
                      {t('earnings.member', 'Member')}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', textTransform: 'uppercase', py: 1.25 }}>
                      {t('earnings.entries', 'Entries')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', textTransform: 'uppercase', py: 1.25 }}>
                      {t('earnings.hours', 'Hours')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', textTransform: 'uppercase', py: 1.25 }}>
                      {t('earnings.totalEarnings', 'Earnings')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.byMember.map((item) => (
                    <TableRow
                      key={item.user.id}
                      hover
                      sx={{ '&:last-child td': { border: 0 } }}
                    >
                      <TableCell sx={{ py: 1.25 }}>
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: 'primary.main',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {item.user.name ? item.user.name.charAt(0).toUpperCase() : '?'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.user.name || t('directory.unnamedUser', 'Unnamed User')}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.25 }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.entryCount}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.25 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {formatDuration(item.totalMinutes)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.25 }}>
                        {item.totalEarningsCents !== null ? (
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {formatMoney(item.totalEarningsCents, report.currency)}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryChip({ icon, label, value, color, faded }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        flex: 1,
        bgcolor: 'action.hover',
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: `${color}.main`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: faded ? 'text.disabled' : `${color}.main`, lineHeight: 1.3 }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
