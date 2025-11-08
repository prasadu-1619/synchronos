import React, { useState } from 'react';
import { UserPlus, X, Mail, Shield } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const InviteMemberModal = ({ isOpen, onClose, projectId, isDark, onInviteSent }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        API_ENDPOINTS.INVITE_SEND,
        {
          projectId,
          email: email.trim(),
          role,
        },
        { withCredentials: true }
      );

      alert('Invitation sent successfully!');
      setEmail('');
      setRole('viewer');
      onInviteSent?.();
      onClose();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      setError(
        error.response?.data?.message ||
        'Failed to send invitation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-lg shadow-xl p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus size={24} />
            <h2 className="text-xl font-semibold">Invite Team Member</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              <Mail size={16} className="inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className={`w-full px-3 py-2 rounded border ${
                isDark
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={loading}
            />
          </div>

          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              <Shield size={16} className="inline mr-1" />
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full px-3 py-2 rounded border ${
                isDark
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={loading}
            >
              <option value="viewer">Viewer - Can only view content</option>
              <option value="editor">Editor - Can edit and create content</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="mb-4 p-3 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm">
            An invitation email will be sent to this address with a link to join the project.
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
