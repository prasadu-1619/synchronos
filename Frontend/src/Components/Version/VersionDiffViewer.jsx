import React, { useState, useEffect } from 'react';
import { Clock, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const VersionDiffViewer = ({ pageId, isDark, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareVersion, setCompareVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [pageId]);

  const fetchVersions = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PAGE_VERSIONS(pageId), {
        withCredentials: true,
      });
      const versionList = response.data.versions || [];
      setVersions(versionList.reverse()); // Most recent first
      
      // Set default comparison: current vs previous
      if (versionList.length > 0) {
        setSelectedVersion(versionList[0]); // Current version
        if (versionList.length > 1) {
          setCompareVersion(versionList[1]); // Previous version
        }
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionIndex) => {
    if (!confirm('Restore this version? Current content will be saved as a new version.')) return;

    setRestoring(true);
    try {
      const versionToRestore = versions[versionIndex];
      console.log('Restoring version:', {
        pageId,
        versionId: versionToRestore._id,
        versionIndex,
      });

      const response = await axios.post(
        API_ENDPOINTS.PAGE_RESTORE(pageId, versionToRestore._id),
        {},
        { withCredentials: true }
      );

      console.log('Restore response:', response.data);
      alert('Version restored successfully!');
      
      // Refresh the page to show restored content
      window.location.reload();
    } catch (error) {
      console.error('Failed to restore version:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to restore version';
      alert(`Error: ${errorMessage}`);
    } finally {
      setRestoring(false);
    }
  };

  // Strip HTML tags and decode HTML entities
  const stripHtml = (html) => {
    if (!html) return '';
    
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, ' ');
    
    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&lsquo;/g, "'")
      .replace(/&rsquo;/g, "'");
    
    // Clean up multiple spaces and trim
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  };

  const getDiff = () => {
    if (!selectedVersion || !compareVersion) return [];

    // Strip HTML tags before comparing
    const oldText = stripHtml(compareVersion.content || '');
    const newText = stripHtml(selectedVersion.content || '');

    return diffWords(oldText, newText);
  };

  // Simple word-based diff
  const diffWords = (oldText, newText) => {
    const oldWords = oldText.split(/(\s+)/);
    const newWords = newText.split(/(\s+)/);
    const diff = [];
    let i = 0, j = 0;

    while (i < oldWords.length || j < newWords.length) {
      if (i >= oldWords.length) {
        diff.push({ type: 'added', value: newWords[j] });
        j++;
      } else if (j >= newWords.length) {
        diff.push({ type: 'removed', value: oldWords[i] });
        i++;
      } else if (oldWords[i] === newWords[j]) {
        diff.push({ type: 'unchanged', value: oldWords[i] });
        i++;
        j++;
      } else {
        // Look ahead to find matching words
        const oldIndex = newWords.indexOf(oldWords[i], j);
        const newIndex = oldWords.indexOf(newWords[j], i);

        if (oldIndex !== -1 && (newIndex === -1 || oldIndex - j < newIndex - i)) {
          // Words were added
          while (j < oldIndex) {
            diff.push({ type: 'added', value: newWords[j] });
            j++;
          }
        } else if (newIndex !== -1) {
          // Words were removed
          while (i < newIndex) {
            diff.push({ type: 'removed', value: oldWords[i] });
            i++;
          }
        } else {
          // Words changed
          diff.push({ type: 'removed', value: oldWords[i] });
          diff.push({ type: 'added', value: newWords[j] });
          i++;
          j++;
        }
      }
    }

    return diff;
  };

  const diff = getDiff();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-3 md:p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Clock size={20} className="md:w-6 md:h-6" />
            <h2 className={`text-lg md:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Version History
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
          >
            <X size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-60px)] md:h-[calc(100vh-80px)]">
        {/* Version List */}
        <div className={`w-full md:w-64 border-b md:border-r md:border-b-0 ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto max-h-48 md:max-h-none`}>
          <div className="p-3 md:p-4">
            <h3 className={`font-semibold mb-2 md:mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Versions ({versions.length})
            </h3>
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
              {versions.map((version, index) => (
                <div
                  key={version._id}
                  onClick={() => setSelectedVersion(version)}
                  className={`min-w-[200px] md:min-w-0 w-full text-left p-2 md:p-3 rounded-lg cursor-pointer ${
                    selectedVersion?._id === version._id
                      ? isDark
                        ? 'bg-blue-900'
                        : 'bg-blue-100'
                      : isDark
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Version {versions.length - index}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDistanceToNow(new Date(version.editedAt), { addSuffix: true })}
                  </div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    By {version.editedBy?.name || 'Unknown'}
                  </div>
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(index);
                      }}
                      disabled={restoring}
                      className="mt-2 text-xs text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw size={12} className="inline mr-1" />
                      Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diff Viewer */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {/* Version Comparison Selector */}
          {versions.length > 1 && (
            <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-sm md:text-base font-semibold mb-3 md:mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Compare Versions
              </h3>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
                {/* First Version Selector */}
                <div className="flex-1">
                  <label className={`text-xs md:text-sm block mb-1.5 md:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Version 1 (Older)
                  </label>
                  <select
                    value={versions.indexOf(compareVersion)}
                    onChange={(e) => setCompareVersion(versions[parseInt(e.target.value)])}
                    className={`w-full px-2 md:px-3 py-2 md:py-2.5 text-sm md:text-base rounded border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {versions.map((v, i) => (
                      <option key={v._id} value={i}>
                        Version {versions.length - i}
                        {i === 0 ? ' (Current)' : ''}
                        {' - '}
                        {formatDistanceToNow(new Date(v.editedAt), { addSuffix: true })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Arrow Icon */}
                <div className="flex items-center justify-center md:mt-6">
                  <ChevronRight size={20} className={`md:w-6 md:h-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>

                {/* Second Version Selector */}
                <div className="flex-1">
                  <label className={`text-xs md:text-sm block mb-1.5 md:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Version 2 (Newer)
                  </label>
                  <select
                    value={versions.indexOf(selectedVersion)}
                    onChange={(e) => setSelectedVersion(versions[parseInt(e.target.value)])}
                    className={`w-full px-2 md:px-3 py-2 md:py-2.5 text-sm md:text-base rounded border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {versions.map((v, i) => (
                      <option key={v._id} value={i}>
                        Version {versions.length - i}
                        {i === 0 ? ' (Current)' : ''}
                        {' - '}
                        {formatDistanceToNow(new Date(v.editedAt), { addSuffix: true })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Comparison Info */}
              <div className={`mt-3 text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>
                  Comparing changes from <strong className={isDark ? 'text-white' : 'text-gray-900'}>
                    Version {versions.length - versions.indexOf(compareVersion)}
                  </strong> to <strong className={isDark ? 'text-white' : 'text-gray-900'}>
                    Version {versions.length - versions.indexOf(selectedVersion)}
                  </strong>
                </p>
              </div>

              {/* Restore Buttons */}
              <div className="mt-3 flex gap-2">
                {versions.indexOf(compareVersion) > 0 && (
                  <button
                    onClick={() => handleRestore(versions.indexOf(compareVersion))}
                    disabled={restoring}
                    className={`px-3 py-1.5 text-sm rounded flex items-center gap-2 ${
                      isDark 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  >
                    <RotateCcw size={14} />
                    Restore Version {versions.length - versions.indexOf(compareVersion)}
                  </button>
                )}
                {versions.indexOf(selectedVersion) > 0 && versions.indexOf(selectedVersion) !== versions.indexOf(compareVersion) && (
                  <button
                    onClick={() => handleRestore(versions.indexOf(selectedVersion))}
                    disabled={restoring}
                    className={`px-3 py-1.5 text-sm rounded flex items-center gap-2 ${
                      isDark 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  >
                    <RotateCcw size={14} />
                    Restore Version {versions.length - versions.indexOf(selectedVersion)}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Diff Content */}
          <div className={`p-3 md:p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`prose prose-sm md:prose-base max-w-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={
                    part.type === 'added'
                      ? isDark 
                        ? 'bg-green-900 text-green-200'
                        : 'bg-green-200 text-green-900'
                      : part.type === 'removed'
                      ? isDark
                        ? 'bg-red-900 text-red-200 line-through'
                        : 'bg-red-200 text-red-900 line-through'
                      : isDark
                      ? 'text-white'
                      : 'text-gray-900'
                  }
                >
                  {part.value}
                </span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex gap-3 md:gap-4 text-xs md:text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 md:w-4 md:h-4 rounded ${isDark ? 'bg-green-900' : 'bg-green-200'}`}></span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Added</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 md:w-4 md:h-4 rounded ${isDark ? 'bg-red-900' : 'bg-red-200'}`}></span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Removed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionDiffViewer;
