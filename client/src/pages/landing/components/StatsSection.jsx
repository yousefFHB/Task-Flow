import { useTranslation } from 'react-i18next';
import { Box, Typography, Container, Grid, Card, Stack, useTheme } from '@mui/material';

export default function StatsSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const stats = [
    { value: t('landing.stats.uptime'), label: t('landing.stats.uptimeLabel'), color: '#10B981' },
    { value: t('landing.stats.latency'), label: t('landing.stats.latencyLabel'), color: '#38BDF8' },
    { value: t('landing.stats.bilingual'), label: t('landing.stats.bilingualLabel'), color: '#6366F1' },
    { value: t('landing.stats.session'), label: t('landing.stats.sessionLabel'), color: '#F59E0B' },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 9 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={2.5}>
          {stats.map((stat, idx) => (
            <Grid item xs={6} md={3} key={idx}>
              <Card
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  textAlign: 'center',
                  borderRadius: 3.5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: stat.color,
                  },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '1.85rem', sm: '2.5rem', md: '2.75rem' },
                    color: stat.color,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: { xs: '0.78rem', sm: '0.875rem' },
                  }}
                >
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
