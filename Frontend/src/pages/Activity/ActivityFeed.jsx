import React, { useEffect, useState } from 'react';
import { Activity as ActivityIcon, Clock, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed = () => {
  const { isDark } = useTheme();
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const typeMap = {
        all: '',
        pages: 'page_',
        boards: 'board_',
        users: 'member_',
      };

      const endpoint = `${API_ENDPOINTS.ACTIVITIES}/user?limit=50`;
      const response = await axios.get(endpoint, {
        withCredentials: true,
      });

      let fetchedActivities = response.data.activities || [];

      // Filter by type if not 'all'
      if (filter !== 'all') {
        const typePrefix = typeMap[filter];
        fetchedActivities = fetchedActivities.filter(a => 
          a.type.startsWith(typePrefix)
        );
      }

      setActivities(fetchedActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityMessage = (activity) => {
    const userName = activity.user?.name || 'Someone';
    const projectName = activity.project?.name || 'a project';
    
    switch (activity.type) {
      case 'project_created':
        return `Created project "${projectName}"`;
      case 'project_updated':
        return `Updated project "${projectName}"`;
      case 'project_deleted':
        return `Deleted project "${projectName}"`;
      case 'member_added':
        return `Joined "${projectName}"`;
      case 'member_removed':
        return `Left "${projectName}"`;
      case 'member_invited':
        return `Invited someone to "${projectName}"`;
      case 'page_created':
        return `Created a page in "${projectName}"`;
      case 'page_updated':
        return `Updated a page in "${projectName}"`;
      case 'page_deleted':
        return `Deleted a page in "${projectName}"`;
      case 'board_created':
        return `Created a board in "${projectName}"`;
      case 'board_updated':
        return `Updated a board in "${projectName}"`;
      case 'card_created':
        return `Created a task in "${projectName}"`;
      case 'card_updated':
        return `Updated a task in "${projectName}"`;
      case 'card_moved':
        return `Moved a task in "${projectName}"`;
      case 'card_deleted':
        return `Deleted a task in "${projectName}"`;
      case 'comment_added':
        return `Added a comment in "${projectName}"`;
      default:
        return `Performed an action in "${projectName}"`;
    }
  };

  const getActivityIcon = (type) => {
    if (type.startsWith('page_')) return '📄';
    if (type.startsWith('board_') || type.startsWith('card_')) return '📋';
    if (type.startsWith('member_')) return '👥';
    if (type.startsWith('project_')) return '📁';
    if (type.startsWith('comment_')) return '💬';
    return '✨';
  };

  return (
    <div className={`p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <ActivityIcon size={32} />
          Activity Feed
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Track all changes across your projects
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['all', 'pages', 'boards', 'users'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        {loading ? (
          <div className="text-center py-16">
            <ActivityIcon
              size={48}
              className={`mx-auto mb-4 animate-spin ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
            />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading activities...
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16">
            <ActivityIcon
              size={48}
              className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
            />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No activity to display yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity) => (
              <div key={activity._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 text-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">{getActivityMessage(activity)}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {activity.user?.name || 'Unknown User'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
