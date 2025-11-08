import React, { useState, useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const Breadcrumbs = ({ projectId, pageId, isDark }) => {
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (pageId) {
      fetchBreadcrumbs();
    }
  }, [pageId]);

  const fetchBreadcrumbs = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PAGE_BY_ID(pageId), {
        withCredentials: true,
      });

      const page = response.data.page;
      const trail = await buildBreadcrumbTrail(page);
      setBreadcrumbs(trail);
    } catch (error) {
      console.error('Failed to fetch breadcrumbs:', error);
    }
  };

  const buildBreadcrumbTrail = async (page, trail = []) => {
    trail.unshift({
      id: page._id,
      title: page.title,
    });

    if (page.parent) {
      try {
        const response = await axios.get(API_ENDPOINTS.PAGE_BY_ID(page.parent), {
          withCredentials: true,
        });
        return buildBreadcrumbTrail(response.data.page, trail);
      } catch (error) {
        return trail;
      }
    }

    return trail;
  };

  const handleNavigate = (crumb) => {
    if (crumb.id) {
      navigate(`/project/${projectId}/page/${crumb.id}`);
    } else {
      navigate(`/project/${projectId}`);
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => navigate(`/project/${projectId}`)}
        className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
      >
        <Home size={14} />
        <span>Project</span>
      </button>

      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          <ChevronRight size={14} className="text-gray-400" />
          <button
            onClick={() => handleNavigate(crumb)}
            className={`px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
              index === breadcrumbs.length - 1
                ? 'font-semibold'
                : ''
            }`}
          >
            {crumb.title}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
