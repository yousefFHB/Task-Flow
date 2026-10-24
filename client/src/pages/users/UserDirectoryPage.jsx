import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

import { useSearchUsersQuery, useGetUserByIdQuery } from '../../Store/servises/userApi.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatDate, normalizePersianDigits } from '../../utils/formatters.js';

export default function UserDirectoryPage() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // RTK Query search hook: skip if activeQuery is empty because backend requires query 'q'
  const {
    data: searchResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSearchUsersQuery(
    { q: activeQuery, page, limit: 10 },
    { skip: !activeQuery.trim() }
  );

  // Hook for single user modal lookup
  const {
    data: singleUserResponse,
    isLoading: isLoadingSingle,
    error: singleError,
  } = useGetUserByIdQuery(selectedUserId, {
    skip: !selectedUserId,
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = normalizePersianDigits(searchInput.trim());
    if (normalized) {
      setActiveQuery(normalized);
      setPage(1);
    }
  };

  const users = searchResponse?.data || [];
  const pagination = searchResponse?.pagination || { page: 1, pages: 1, total: 0 };
  const singleUser = singleUserResponse?.data;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          {t('directory.title')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          {t('directory.subtitle')}
        </Typography>
      </Box>

      {/* Search Input Bar */}
      <Card sx={{ mb: 4, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
          <Box component="form" onSubmit={handleSearchSubmit}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder={t('directory.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!searchInput.trim() || isFetching}
                sx={{
                  px: 3.5,
                  py: 1,
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                {t('directory.searchButton')}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Results Content Area */}
      {!activeQuery ? (
        <EmptyState
          icon={PeopleAltOutlinedIcon}
          title={t('directory.emptyInitialTitle')}
          description={t('directory.emptyInitialDesc')}
        />
      ) : isLoading ? (
        <LoadingSkeleton count={4} height={56} />
      ) : error ? (
        <ErrorMessage
          title={t('directory.userNotFound')}
          message={error}
          onRetry={refetch}
        />
      ) : users.length === 0 ? (
        <EmptyState
          title={t('directory.noResultsTitle', { query: activeQuery })}
          description={t('directory.noResultsDesc')}
          actionText={t('directory.clearSearch')}
          onAction={() => {
            setSearchInput('');
            setActiveQuery('');
          }}
        />
      ) : (
        <Card sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {t('directory.tableUser')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {t('directory.tablePhone')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {t('directory.tableId')}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {t('directory.tableActions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            bgcolor: 'primary.light',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                          }}
                        >
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {u.name || t('directory.unnamedUser')}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        {u.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`#${u.id}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => setSelectedUserId(u.id)}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        {t('common.details')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.pages > 1 && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={pagination.pages}
                page={page}
                onChange={(_, val) => setPage(val)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Card>
      )}

      {/* User Details Modal (GET /api/users/:id) */}
      <Dialog
        open={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t('directory.modalTitle')}
          </Typography>
          <IconButton size="small" onClick={() => setSelectedUserId(null)}>
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 } }}>
          {isLoadingSingle ? (
            <LoadingSkeleton count={2} height={40} />
          ) : singleError ? (
            <ErrorMessage title={t('directory.userNotFound')} message={singleError} />
          ) : singleUser ? (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'primary.main',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                  }}
                >
                  {singleUser.name ? singleUser.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
                    {singleUser.name || t('directory.unnamedUser')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {t('directory.tableId')}: #{singleUser.id}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  {t('directory.modalPhoneTitle')}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.primary' }}>
                  {singleUser.phoneNumber}
                </Typography>
              </Box>
              {singleUser.createdAt && (
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    {t('directory.memberSince')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {formatDate(singleUser.createdAt)}
                  </Typography>
                </Box>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, px: 3.5 }}>
          <Button onClick={() => setSelectedUserId(null)} sx={{ px: 2.5 }}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
