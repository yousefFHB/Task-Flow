import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  useTheme,
} from '@mui/material';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FolderSpecialOutlinedIcon from '@mui/icons-material/FolderSpecialOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

export default function FeaturesGrid() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isRtl = theme.direction === 'rtl';

  const features = [
    {
      icon: <ViewKanbanOutlinedIcon sx={{ fontSize: 28 }} />,
      color: '#6366F1',
      title: t('landing.features.kanbanTitle'),
      desc: t('landing.features.kanbanDesc'),
      highlights: isRtl
        ? ['انتقال روان با درگ و دراپ', 'اولویت‌بندی ۴ مرحله‌ای', 'تخصیص آنی تسک به اعضا']
        : ['Drag & Drop Kanban boards', '4-tier priority levels', 'Subtasks & checklists'],
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 28 }} />,
      color: '#38BDF8',
      title: t('landing.features.timeTitle'),
      desc: t('landing.features.timeDesc'),
      highlights: isRtl
        ? ['تایمر زنده و ورود دستی ساعت', 'مقایسه تخمین و کارکرد واقعی', 'سوابق کامل تغییرات و نظرات']
        : ['Live stopwatch & manual logging', 'Estimate vs actual hours', 'Audit trail & discussions'],
    },
    {
      icon: <FolderSpecialOutlinedIcon sx={{ fontSize: 28 }} />,
      color: '#818CF8',
      title: t('landing.features.projectsTitle'),
      desc: t('landing.features.projectsDesc'),
      highlights: isRtl
        ? ['کلیدهای پروژه منحصربه‌فرد', 'پیگیری مهلت تحویل و فازها', 'اتصال پروژه‌ها به تیم‌ها']
        : ['Unique project key indexing', 'Milestone & deadline alerts', 'Multi-team project mapping'],
    },
    {
      icon: <GroupsOutlinedIcon sx={{ fontSize: 28 }} />,
      color: '#F59E0B',
      title: t('landing.features.teamsTitle'),
      desc: t('landing.features.teamsDesc'),
      highlights: isRtl
        ? ['تعریف تیم‌های فنی و محصولی', 'تعیین سرپرست و اعضا', 'فهرست پرسنل با فیلتر سریع']
        : ['Department squad structuring', 'Team lead designation', 'Instant personnel directory'],
    },
    {
      icon: <BoltOutlinedIcon sx={{ fontSize: 28 }} />,
      color: '#10B981',
      title: t('landing.features.realtimeTitle'),
      desc: t('landing.features.realtimeDesc'),
      highlights: isRtl
        ? ['ارتباط سوکت دوطرفه', 'به‌روزرسانی بدون رفرش صفحه', 'نشانگر اعلان‌های خوانده‌نشده']
        : ['Zero-refresh Socket.IO push', 'Instant status changes', 'Unread badge counters'],
    },
    {
      icon: <SecurityOutlinedIcon sx={{ fontSize: 28 }} />,
      color: '#EC4899',
      title: t('landing.features.enterpriseTitle'),
      desc: t('landing.features.enterpriseDesc'),
      highlights: isRtl
        ? ['تایپوگرافی فارسی وزیرمتن', 'پوسته تاریک و روشن هماهنگ', 'مدیریت اعتبار ۲۴ ساعته نشست']
        : ['Vazirmatn & system fonts', 'Synchronized Dark/Light themes', '24h cryptographic JWT session'],
    },
  ];

  return (
    <Box id="features" sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 8 } }}>
          <Chip
            label={isRtl ? 'ستون‌های اصلی پلتفرم' : 'Platform Pillars'}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700, borderRadius: 2 }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            {t('landing.features.sectionTitle')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 700,
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              lineHeight: 1.6,
            }}
          >
            {t('landing.features.sectionSubtitle')}
          </Typography>
        </Stack>

        {/* Feature Cards Grid */}
        <Grid container spacing={3}>
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3.5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: feature.color,
                    transform: 'translateY(-4px)',
                    boxShadow: isDark
                      ? `0 12px 30px -10px ${feature.color}33`
                      : `0 12px 30px -10px rgba(0, 0, 0, 0.08)`,
                  },
                }}
              >
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Icon Container */}
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isDark ? `${feature.color}1A` : `${feature.color}15`,
                      color: feature.color,
                      mb: 2.5,
                    }}
                  >
                    {feature.icon}
                  </Box>

                  {/* Title & Desc */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25, color: 'text.primary' }}>
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.65,
                      mb: 2.5,
                      flex: 1,
                    }}
                  >
                    {feature.desc}
                  </Typography>

                  {/* Highlights */}
                  <Stack spacing={1} sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    {feature.highlights.map((h, i) => (
                      <Stack key={i} direction="row" spacing={1} alignItems="center">
                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: feature.color }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {h}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
