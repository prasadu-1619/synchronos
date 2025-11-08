import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Check, X, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const CommentThread = ({ pageId, isDark }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (showComments && pageId) {
      fetchComments();
    }
  }, [showComments, pageId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PAGE_BY_ID(pageId), {
        withCredentials: true,
      });
      setComments(response.data.page.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        `${API_ENDPOINTS.PAGE_BY_ID(pageId)}/comments`,
        { text: newComment },
        { withCredentials: true }
      );

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComment = async (commentId) => {
    try {
      await axios.put(
        `${API_ENDPOINTS.PAGE_BY_ID(pageId)}/comments/${commentId}/resolve`,
        {},
        { withCredentials: true }
      );
      fetchComments();
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await axios.delete(
        `${API_ENDPOINTS.PAGE_BY_ID(pageId)}/comments/${commentId}`,
        { withCredentials: true }
      );
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const unresolvedComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setShowComments(!showComments)}
        className={`fixed right-6 bottom-6 p-4 rounded-full shadow-lg z-40 ${
          isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
        title="Comments"
      >
        <MessageSquare size={24} />
        {unresolvedComments.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {unresolvedComments.length}
          </span>
        )}
      </button>

      {/* Comments Panel */}
      {showComments && (
        <div
          className={`fixed right-0 top-0 h-full w-96 shadow-2xl z-50 flex flex-col ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Comments</h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className={`flex-1 px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-900 border-gray-700 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Unresolved Comments */}
            {unresolvedComments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-500">Open</h4>
                {unresolvedComments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    onResolve={() => handleResolveComment(comment._id)}
                    onDelete={() => handleDeleteComment(comment._id)}
                    canDelete={comment.user?._id === user?._id}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}

            {/* Resolved Comments */}
            {resolvedComments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-500">Resolved</h4>
                {resolvedComments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    onResolve={() => handleResolveComment(comment._id)}
                    onDelete={() => handleDeleteComment(comment._id)}
                    canDelete={comment.user?._id === user?._id}
                    isDark={isDark}
                    resolved
                  />
                ))}
              </div>
            )}

            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-2 opacity-30" />
                <p>No comments yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CommentItem = ({ comment, onResolve, onDelete, canDelete, isDark, resolved }) => {
  return (
    <div
      className={`p-3 rounded-lg border ${
        resolved
          ? isDark
            ? 'bg-gray-900/50 border-gray-700 opacity-60'
            : 'bg-gray-50 border-gray-200 opacity-60'
          : isDark
          ? 'bg-gray-900 border-gray-700'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
            {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-medium text-sm">{comment.user?.name || 'Unknown'}</div>
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={onResolve}
            className={`p-1 rounded ${
              resolved ? 'text-green-500' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={resolved ? 'Reopen' : 'Resolve'}
          >
            <Check size={16} />
          </button>
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
              title="Delete"
            >
              <Trash size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm">{comment.text}</p>

      {resolved && comment.resolvedBy && (
        <div className="mt-2 text-xs text-gray-500">
          Resolved by {comment.resolvedBy.name}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
