import React from 'react';

const LiveCursor = ({ user, position, color }) => {
  if (!position || !user) return null;

  return (
    <div
      className="absolute pointer-events-none z-[9999] transition-all duration-100 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(0, 0)',
      }}
    >
      {/* Cursor pointer */}
      <svg
        width="20"
        height="24"
        viewBox="0 0 20 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
      >
        <path
          d="M2 2 L2 22 L8 16 L11 22 L13 21 L10 15 L18 14 L2 2Z"
          fill={color || '#3B82F6'}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* User name label */}
      <div
        className="absolute top-0 left-6 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
        style={{
          backgroundColor: color || '#3B82F6',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        {user.name || 'Anonymous'}
      </div>
    </div>
  );
};

export default LiveCursor;
