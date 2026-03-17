"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-sm font-medium text-[#333333] mb-1">Something went wrong</p>
            <p className="text-xs text-[#A3A3A3]">Try refreshing the page</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 text-xs text-[#2D6A4F] hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
