import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Also save it to local storage so I can retrieve it maybe?
    localStorage.setItem("LAST_CRASH", JSON.stringify({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    }));
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fee', color: '#900', fontFamily: 'monospace', height: '100vh', overflow: 'auto' }}>
          <h2>React Crashed!</h2>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <pre>{this.state.error?.stack}</pre>
          <hr />
          <pre>{this.state.errorInfo?.componentStack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
