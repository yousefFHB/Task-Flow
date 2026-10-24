import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

import LandingNavbar from './components/LandingNavbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import DashboardTour from './components/DashboardTour.jsx';
import StatsSection from './components/StatsSection.jsx';
import FeaturesGrid from './components/FeaturesGrid.jsx';
import LandingCtaSection from './components/LandingCtaSection.jsx';
import LandingFooter from './components/LandingFooter.jsx';

export default function LandingPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t('common.appName')} - ${t('landing.hero.badge')}`;
  }, [t]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LandingNavbar />
      <Box component="main" sx={{ flex: 1 }}>
        <HeroSection />
        <DashboardTour />
        <StatsSection />
        <FeaturesGrid />
        <LandingCtaSection />
      </Box>
      <LandingFooter />
    </Box>
  );
}
