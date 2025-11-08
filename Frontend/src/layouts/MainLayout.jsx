import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Components/Layout/Sidebar';
import TopBar from '../Components/Layout/TopBar';
import { useTheme } from '../contexts/ThemeContext';

const MainLayout = () => {
  const { isDark } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Bar */}
      <TopBar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} />
        
        {/* Main Content */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
