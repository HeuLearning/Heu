import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught an error:", error, errorInfo);
  }

  render() {
    // if (this.state.hasError) {
      // return this.props.fallback || <h1>Something went wrong.</h1>;
    // }
    return <div>error</div>
    // return this.props.children;
  }
}

export default ErrorBoundary;