import { Box, Skeleton, Card, CardContent, Stack } from '@mui/material';

export default function LoadingSkeleton({ count = 3, height = 72 }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="45%" height={20} sx={{ mb: 0.75 }} />
                <Skeleton variant="text" width="72%" height={16} sx={{ mb: 0.5 }} />
                {height > 60 && <Skeleton variant="rounded" height={Math.max(height - 60, 32)} sx={{ borderRadius: 1.5, mt: 1 }} />}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
