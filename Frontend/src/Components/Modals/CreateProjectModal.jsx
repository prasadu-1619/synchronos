import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useTheme } from '../../contexts/ThemeContext';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProject } = useProject();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-blue-500',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name) {
      setError('Project name is required');
      setLoading(false);
      return;
    }

    const result = await createProject(formData);

    if (result.success) {
      onClose();
      setFormData({ name: '', description: '', color: 'bg-blue-500' });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-xl shadow-2xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Create New Project</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="My Awesome Project"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="input-field resize-none"
              placeholder="What's this project about?"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Color
            </label>
            <div className="flex gap-3 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg ${color} ${
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-blue-500'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
