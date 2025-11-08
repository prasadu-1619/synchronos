import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#dc2626' }}>Something went wrong</h1>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', padding: '10px', background: '#fee', marginBottom: '10px' }}>
              Click to see error details
            </summary>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
              <h3>Error:</h3>
              <pre style={{ color: '#dc2626', overflowX: 'auto' }}>
                {this.state.error && this.state.error.toString()}
              </pre>
              <h3 style={{ marginTop: '20px' }}>Component Stack:</h3>
              <pre style={{ color: '#666', overflowX: 'auto' }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
