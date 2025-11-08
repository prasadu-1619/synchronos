import React from 'react';
import { Settings as SettingsIcon, User, Bell, Lock, Palette } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Settings = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className={`p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <SettingsIcon size={32} />
          Settings
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your account and preferences
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Profile Settings */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User size={20} />
            Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="input-field"
                disabled
              />
            </div>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell size={20} />
            Notifications
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5" />
              <span>Email notifications for mentions</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5" />
              <span>Email notifications for assignments</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5" />
              <span>Desktop notifications</span>
            </label>
          </div>
        </div>

        {/* Security */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lock size={20} />
            Security
          </h2>
          <button className="btn-secondary">Change Password</button>
        </div>

        {/* Appearance */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Palette size={20} />
            Appearance
          </h2>
          <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Theme preference is managed via the top bar toggle
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
