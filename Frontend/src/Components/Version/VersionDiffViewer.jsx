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
      if (versionList.length > 0) {
        setSelectedVersion(versionList[0]);
        if (versionList.length > 1) {
          setCompareVersion(versionList[1]);
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
      await axios.post(
        API_ENDPOINTS.PAGE_RESTORE(pageId, versions[versionIndex]._id),
        {},
        { withCredentials: true }
      );
      alert('Version restored successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to restore version:', error);
      alert('Failed to restore version');
    } finally {
      setRestoring(false);
    }
  };

  const getDiff = () => {
    if (!selectedVersion || !compareVersion) return [];

    const oldText = compareVersion.content || '';
    const newText = selectedVersion.content || '';

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
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={24} />
            <h2 className="text-xl font-semibold">Version History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Version List */}
        <div className={`w-64 border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto`}>
          <div className="p-4">
            <h3 className="font-semibold mb-3">Versions ({versions.length})</h3>
            {versions.map((version, index) => (
              <div
                key={version._id}
                onClick={() => setSelectedVersion(version)}
                className={`w-full text-left p-3 rounded-lg mb-2 cursor-pointer ${
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
                  <span className="text-sm font-medium">Version {versions.length - index}</span>
                  {index === 0 && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(version.editedAt), { addSuffix: true })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
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

        {/* Diff Viewer */}
        <div className="flex-1 overflow-y-auto p-6">
          {compareVersion && (
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm text-gray-500">Comparing:</span>
                  <div className="font-medium">
                    Version {versions.indexOf(compareVersion) + 1}
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500">With:</span>
                  <div className="font-medium">
                    Version {versions.indexOf(selectedVersion) + 1}
                  </div>
                </div>
              </div>

              <select
                value={versions.indexOf(compareVersion)}
                onChange={(e) => setCompareVersion(versions[parseInt(e.target.value)])}
                className={`px-3 py-2 rounded border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
              >
                {versions.map((v, i) => (
                  <option key={v._id} value={i}>
                    Version {versions.length - i}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Diff Content */}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="prose prose-sm max-w-none">
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={
                    part.type === 'added'
                      ? 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-200'
                      : part.type === 'removed'
                      ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 line-through'
                      : ''
                  }
                >
                  {part.value}
                </span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-200 dark:bg-green-900 rounded"></span>
              <span>Added</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-200 dark:bg-red-900 rounded"></span>
              <span>Removed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionDiffViewer;
