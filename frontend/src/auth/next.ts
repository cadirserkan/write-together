// After logging in we send people back to the page they came from (?next=/invite/ABC).
// Only paths inside this app are accepted, never a full URL to another site.
export function safeNextPath(next: string | null): string {
  if (next !== null && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }
  return '/';
}
