import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('INRFS page error', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return <main className="route-error" role="alert"><h1>Something went wrong</h1><p>The page could not be displayed safely.</p><button type="button" onClick={() => window.location.reload()}>Reload application</button></main>;
  }
}
