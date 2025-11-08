import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>Test Page - React is Working! ✅</h1>
      <p>If you see this, React is loading correctly.</p>
      <p>Current Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default TestApp;
