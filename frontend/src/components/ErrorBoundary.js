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
    console.error("ErrorBoundary caught an error:", error);
    console.error(errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-ticketmi-error">Something went wrong.</h1>
          <p className="text-ticketmi-text">Please refresh the page.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: 20 }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}


export default ErrorBoundary;
