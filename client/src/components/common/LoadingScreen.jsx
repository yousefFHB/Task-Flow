import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingScreen({ message = 'Loading application...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <CircularProgress
        size={44}
        thickness={4}
        sx={{ color: 'primary.main', mb: 2.5 }}
      />
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', fontWeight: 500 }}
      >
        {message}
      </Typography>
    </Box>
  );
}
