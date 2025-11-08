import React from 'react';
import { Users } from 'lucide-react';

const ActiveUsers = ({ users, isDark }) => {
  if (!users || users.length === 0) return null;

  // Generate a random color for users without a color
  const getRandomColor = (userId) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    const index = (userId?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <Users size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
      <div className="flex items-center -space-x-2">
        {users.slice(0, 5).map((user, index) => {
          const userColor = user?.userColor || getRandomColor(user?.userId);
          const userName = user?.userName || 'Anonymous';
          
          return (
            <div
              key={user?.userId || index}
              className="relative group"
              style={{ zIndex: users.length - index }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-white dark:border-gray-900 cursor-pointer"
                style={{ backgroundColor: userColor }}
                title={userName}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {userName}
              </div>
            </div>
          );
        })}
        {users.length > 5 && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white bg-gray-500 border-2 border-white dark:border-gray-900">
            +{users.length - 5}
          </div>
        )}
      </div>
      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {users.length} {users.length === 1 ? 'editor' : 'editors'}
      </span>
    </div>
  );
};

export default ActiveUsers;
