import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SendIcon from '@mui/icons-material/Send';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '../../Store/servises/taskCommentApi/index.js';
import { useAppSelector } from '../../Store/hooks.js';
import { selectCurrentUser } from '../../Store/Slice/authSlice.js';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import EmptyState from '../common/EmptyState.jsx';
import LoadingSkeleton from '../common/LoadingSkeleton.jsx';
import { formatDate, formatNumber } from '../../utils/formatters.js';

export default function TaskCommentsSection({ taskId }) {
  const { t } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading } = useGetCommentsQuery({ taskId });
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const comments = data?.data || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setErrorMsg('');

    try {
      await createComment({ taskId, content: newComment.trim() }).unwrap();
      setNewComment('');
    } catch (err) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to post comment');
    }
  };

  const handleStartEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;
    setErrorMsg('');
    try {
      await updateComment({ id: commentId, content: editContent.trim(), taskId }).unwrap();
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to update comment');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteComment({ id: deletingId, taskId }).unwrap();
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} height={70} />;
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
        <ChatBubbleOutlineOutlinedIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('comments.title')} ({formatNumber(comments.length)})
        </Typography>
      </Stack>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      )}

      {/* New Comment Input Box */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box component="form" onSubmit={handleCreate}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                src={currentUser?.avatar}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  mt: 0.5,
                }}
              >
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={6}
                  placeholder={t('comments.writePlaceholder')}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 1.5 }}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={!newComment.trim() || isCreating}
                    startIcon={isCreating ? <CircularProgress size={16} /> : <SendIcon sx={{ fontSize: 16 }} />}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                  >
                    {t('comments.postComment')}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Comments List */}
      {comments.length === 0 ? (
        <EmptyState
          icon={ChatBubbleOutlineOutlinedIcon}
          title={t('comments.noComments')}
          description={t('comments.title')}
        />
      ) : (
        <Stack spacing={2}>
          {comments.map((comment) => {
            const isAuthor = comment.userId === currentUser?.id;
            const isEditingThis = editingId === comment.id;
            const formattedDate = comment.createdAt ? formatDate(comment.createdAt, { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <Card key={comment.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar
                      src={comment.user?.avatar}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        bgcolor: isAuthor ? 'primary.main' : 'grey.600',
                      }}
                    >
                      {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {comment.user?.name || 'User'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {formattedDate}
                          </Typography>
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                              {t('comments.edited')}
                            </Typography>
                          )}
                        </Stack>

                        {isAuthor && !isEditingThis && (
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title={t('common.details')}>
                              <IconButton
                                size="small"
                                onClick={() => handleStartEdit(comment)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <EditOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('common.delete')}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeletingId(comment.id)}
                              >
                                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </Stack>

                      {isEditingThis ? (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={handleCancelEdit}
                              startIcon={<CloseIcon />}
                              sx={{ textTransform: 'none' }}
                            >
                              {t('common.cancel')}
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              disabled={!editContent.trim() || isUpdating}
                              onClick={() => handleSaveEdit(comment.id)}
                              startIcon={isUpdating ? <CircularProgress size={14} /> : <CheckIcon />}
                              sx={{ textTransform: 'none' }}
                            >
                              {t('common.save')}
                            </Button>
                          </Stack>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ mt: 0.75, color: 'text.primary', whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                        >
                          {comment.content}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title={t('common.delete')}
        message={t('comments.deleteConfirm')}
        confirmText={t('common.delete')}
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </Box>
  );
}
