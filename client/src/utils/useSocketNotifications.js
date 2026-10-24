import { useEffect } from 'react';
import { useAppDispatch } from '../Store/hooks.js';
import { apiSlice } from '../Store/api/apiSlice.js';
import { getSocket } from './socket.js';

export function useSocketNotifications(onNotificationReceived) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      // Invalidate notification queries to refresh list and count in RTK Query
      dispatch(apiSlice.util.invalidateTags([{ type: 'Notification', id: 'UNREAD_COUNT' }, { type: 'Notification', id: 'LIST' }]));
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    };

    const handleTaskUpdated = (data) => {
      if (data?.id) {
        dispatch(apiSlice.util.invalidateTags([
          { type: 'Task', id: data.id },
          { type: 'Task', id: 'LIST' },
          { type: 'TaskHistory', id: `TASK_${data.id}` },
        ]));
      }
    };

    const handleCommentCreated = (comment) => {
      if (comment?.taskId) {
        dispatch(apiSlice.util.invalidateTags([
          { type: 'TaskComment', id: `TASK_${comment.taskId}` },
          { type: 'TaskHistory', id: `TASK_${comment.taskId}` },
        ]));
      }
    };

    const handleCommentDeleted = (data) => {
      if (data?.taskId) {
        dispatch(apiSlice.util.invalidateTags([
          { type: 'TaskComment', id: `TASK_${data.taskId}` },
          { type: 'TaskHistory', id: `TASK_${data.taskId}` },
        ]));
      }
    };

    const handleTimeEntryCreated = (entry) => {
      if (entry?.taskId) {
        dispatch(apiSlice.util.invalidateTags([
          { type: 'TimeEntry', id: `TASK_SUMMARY_${entry.taskId}` },
          { type: 'TaskHistory', id: `TASK_${entry.taskId}` },
        ]));
      }
      if (entry?.projectId) {
        dispatch(apiSlice.util.invalidateTags([
          { type: 'TimeEntry', id: `PROJECT_SUMMARY_${entry.projectId}` },
        ]));
      }
      dispatch(apiSlice.util.invalidateTags([{ type: 'TimeEntry', id: 'LIST' }]));
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('comment_created', handleCommentCreated);
    socket.on('comment_deleted', handleCommentDeleted);
    socket.on('time_entry_created', handleTimeEntryCreated);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('comment_created', handleCommentCreated);
      socket.off('comment_deleted', handleCommentDeleted);
      socket.off('time_entry_created', handleTimeEntryCreated);
    };
  }, [dispatch, onNotificationReceived]);
}

export default useSocketNotifications;
