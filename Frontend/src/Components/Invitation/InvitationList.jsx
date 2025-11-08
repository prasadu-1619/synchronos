import React, { useState, useEffect } from 'react';
import { Mail, Clock, UserCheck, UserX, Trash2, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const InvitationList = ({ projectId, isDark }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, [projectId]);

  const fetchInvitations = async () => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.INVITE_PROJECT(projectId),
        { withCredentials: true }
      );
      setInvitations(response.data.invitations || []);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (invitationId) => {
    if (!confirm('Cancel this invitation?')) return;

    try {
      await axios.delete(
        API_ENDPOINTS.INVITE_CANCEL(invitationId),
        { withCredentials: true }
      );
      setInvitations(invitations.filter(inv => inv._id !== invitationId));
      alert('Invitation cancelled');
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      alert('Failed to cancel invitation');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      accepted: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      expired: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    };

    const icons = {
      pending: Clock,
      accepted: UserCheck,
      rejected: UserX,
      expired: Clock,
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      viewer: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      member: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      admin: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colors[role]}`}>
        <Shield size={12} />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center p-8 text-gray-400">
        <Mail size={48} className="mx-auto mb-3 opacity-50" />
        <p>No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <div
          key={invitation._id}
          className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} />
                <span className="font-medium">{invitation.email}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(invitation.status)}
                {getRoleBadge(invitation.role)}
              </div>

              <div className="text-sm text-gray-400">
                Invited {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                {' by '}
                {invitation.invitedBy?.name || 'Unknown'}
              </div>

              {invitation.status === 'pending' && (
                <div className="text-xs text-gray-400 mt-1">
                  Expires {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
                </div>
              )}
            </div>

            {invitation.status === 'pending' && (
              <button
                onClick={() => handleCancel(invitation._id)}
                className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                title="Cancel invitation"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvitationList;
