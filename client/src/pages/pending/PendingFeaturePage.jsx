import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import PendingFeatureNotice from '../../components/common/PendingFeatureNotice.jsx';

export default function PendingFeaturePage() {
  const { t } = useTranslation();
  const location = useLocation();

  const featureConfigs = {
    '/tasks': {
      title: t('features.tasksTitle'),
      domain: t('features.tasksDomain'),
      model: 'Task, TaskComment, TaskHistory, TaskAttachment, TaskLabel, Label',
      details: t('features.tasksDetails'),
    },
    '/projects': {
      title: t('features.projectsTitle'),
      domain: t('features.projectsDomain'),
      model: 'Project, ProjectMember',
      details: t('features.projectsDetails'),
    },
    '/teams': {
      title: t('features.teamsTitle'),
      domain: t('features.teamsDomain'),
      model: 'Team, TeamMember',
      details: t('features.teamsDetails'),
    },
    '/sprints': {
      title: t('features.sprintsTitle'),
      domain: t('features.sprintsDomain'),
      model: 'Sprint (PLANNED, ACTIVE, COMPLETED)',
      details: t('features.sprintsDetails'),
    },
    '/notifications': {
      title: t('features.notificationsTitle'),
      domain: t('features.notificationsDomain'),
      model: 'Notification',
      details: t('features.notificationsDetails'),
    },
  };

  const config = featureConfigs[location.pathname] || {
    title: t('common.pending'),
    domain: t('common.pending'),
    model: 'Prisma Schema Model',
    details: t('pendingNotice.readyNotice'),
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          {config.title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.65 }}>
          {t('pendingNotice.domainStatus', { domain: config.domain })}
        </Typography>
      </Box>

      <PendingFeatureNotice
        featureName={config.title}
        domainArea={config.domain}
        modelName={config.model}
        details={config.details}
      />
    </Box>
  );
}
