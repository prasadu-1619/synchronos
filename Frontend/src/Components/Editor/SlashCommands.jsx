import React, { useEffect, useState, useRef } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Table,
  Quote,
  Minus,
} from 'lucide-react';

const SlashCommands = ({ position, searchQuery, onSelect, onClose, isDark }) => {
  const menuRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { id: 'heading1', label: 'Heading 1', icon: Heading1, description: 'Large section heading' },
    { id: 'heading2', label: 'Heading 2', icon: Heading2, description: 'Medium section heading' },
    { id: 'heading3', label: 'Heading 3', icon: Heading3, description: 'Small section heading' },
    { id: 'bulletlist', label: 'Bullet List', icon: List, description: 'Create a simple bullet list' },
    { id: 'orderedlist', label: 'Numbered List', icon: ListOrdered, description: 'Create a numbered list' },
    { id: 'todo', label: 'Todo List', icon: CheckSquare, description: 'Track tasks with checkboxes' },
    { id: 'code', label: 'Code Block', icon: Code, description: 'Highlight code with syntax' },
    { id: 'table', label: 'Table', icon: Table, description: 'Insert a 3x3 table' },
    { id: 'quote', label: 'Quote', icon: Quote, description: 'Insert a blockquote' },
    { id: 'divider', label: 'Divider', icon: Minus, description: 'Insert a horizontal line' },
  ];

  const filteredCommands = searchQuery
    ? commands.filter(cmd =>
        cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : commands;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredCommands, onSelect, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filteredCommands.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={`fixed z-50 w-80 rounded-lg shadow-xl border ${
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <div className="py-2">
        {filteredCommands.map((command, index) => {
          const Icon = command.icon;
          return (
            <button
              key={command.id}
              onClick={() => onSelect(command.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                index === selectedIndex
                  ? isDark
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                  : ''
              } ${
                isDark
                  ? 'hover:bg-gray-700 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className={`p-2 rounded ${isDark ? 'bg-gray-900' : 'bg-gray-200'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{command.label}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {command.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlashCommands;
