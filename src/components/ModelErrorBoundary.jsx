import { Component } from "react";

export class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("3D body explorer failed to load", error);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}
