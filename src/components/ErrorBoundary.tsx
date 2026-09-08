import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error in ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("checkin_checkout_cohort_v2");
        localStorage.removeItem("checkin_checkout_day_v2");
        localStorage.removeItem("checkin_checkout_active_hire_v2");
        localStorage.removeItem("checkin_checkout_onboarding_state");
      }
    } catch (e) {
      console.warn("Error resetting storage:", e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="app-error-boundary"
          className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Application State Recovered</h2>
              <p className="text-sm text-slate-400 mt-1">
                A transient rendering error occurred. You can restore default dark store ramp state safely below.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-left overflow-auto max-h-32 text-xs font-mono text-slate-300">
                {this.state.error.toString()}
              </div>
            )}

            <button
              id="btn-error-reset-state"
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Clean State & Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
