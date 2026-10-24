import { useTranslation } from 'react-i18next';
import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function PendingFeatureNotice({
  featureName,
  domainArea,
  details,
  modelName,
}) {
  const { t } = useTranslation();

  const title = featureName || t('common.pending');
  const domain = domainArea || t('common.pending');
  const detailsText = details || t('pendingNotice.readyNotice');

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          bgcolor: 'warning.light',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ConstructionOutlinedIcon sx={{ color: 'warning.dark', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ color: 'warning.dark', fontWeight: 700 }}>
            {t('pendingNotice.bannerTitle')}
          </Typography>
        </Stack>
        <Chip
          label={t('pendingNotice.badgeLabel')}
          size="small"
          sx={{
            bgcolor: 'warning.main',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.75rem',
            px: 0.5,
          }}
        />
      </Box>

      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, '&:last-child': { pb: { xs: 2.5, sm: 3.5 } } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.65 }}>
          {detailsText}
        </Typography>

        <Box
          sx={{
            p: 2.5,
            bgcolor: 'action.hover',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <InfoOutlinedIcon sx={{ color: 'info.main', fontSize: 20, mt: 0.25, flexShrink: 0 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.5 }}>
              {t('pendingNotice.domainStatus', { domain })}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {modelName
                ? t('pendingNotice.prismaNotice', { model: modelName })
                : t('pendingNotice.readyNotice')}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
