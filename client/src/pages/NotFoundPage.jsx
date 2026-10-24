import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Container } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 6,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '5rem',
            fontWeight: 800,
            color: 'primary.main',
            lineHeight: 1,
            mb: 2,
          }}
        >
          {t('notFound.code')}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {t('notFound.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mb: 3.5 }}>
          {t('notFound.description')}
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          startIcon={<HomeOutlinedIcon />}
        >
          {t('notFound.button')}
        </Button>
      </Box>
    </Container>
  );
}
