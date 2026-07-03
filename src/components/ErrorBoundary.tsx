import { Component, ErrorInfo, ReactNode } from "react";
import ErrorScreen from "./ErrorScreen";

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          code="500"
          title="Something broke"
          message={this.state.error?.message || "An unexpected error occurred while rendering."}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
