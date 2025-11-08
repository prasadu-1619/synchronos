import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, User, Tag, Link as LinkIcon, MoreVertical, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const InlineCardEditor = ({ card, boardId, onUpdate, onDelete, isDark, onClose }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [status, setStatus] = useState(card.status);
  const [priority, setPriority] = useState(card.priority || 'medium');
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
  );
  const [assignedTo, setAssignedTo] = useState(card.assignedTo?._id || '');
  const [showActions, setShowActions] = useState(false);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    // Auto-resize description textarea
    if (descRef.current) {
      descRef.current.style.height = 'auto';
      descRef.current.style.height = descRef.current.scrollHeight + 'px';
    }
  }, [description]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || undefined,
        assignedTo: assignedTo || undefined,
      };

      const response = await axios.put(
        API_ENDPOINTS.CARD_DETAIL(boardId, card._id),
        updateData,
        { withCredentials: true }
      );

      onUpdate(response.data.card);
      onClose();
    } catch (error) {
      console.error('Failed to update card:', error);
      alert('Failed to update card');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this card? This action cannot be undone.')) return;

    try {
      await axios.delete(
        API_ENDPOINTS.CARD_DETAIL(boardId, card._id),
        { withCredentials: true }
      );
      onDelete(card._id);
      onClose();
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  const priorityColors = {
    low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    high: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    urgent: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-lg shadow-2xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex-1">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full text-xl font-semibold bg-transparent border-none outline-none ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              placeholder="Card title..."
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded hover:bg-gray-700"
            >
              <MoreVertical size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Actions Menu */}
        {showActions && (
          <div className="absolute right-4 top-16 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-900 text-red-500"
            >
              <Trash2 size={16} />
              Delete Card
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 rounded border resize-none ${
                isDark
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Add a more detailed description..."
              rows={3}
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Tag size={16} className="inline mr-1" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date & Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar size={16} className="inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <User size={16} className="inline mr-1" />
                Assigned To
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="User ID"
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-sm text-gray-400`}>
            <div className="flex justify-between">
              <span>
                Created {formatDistanceToNow(new Date(card.createdAt), { addSuffix: true })}
              </span>
              <span>
                Updated {formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Ctrl+Enter to save • Esc to cancel
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineCardEditor;
