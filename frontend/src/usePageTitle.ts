import { useEffect } from 'react';

const APP_NAME = 'Write Together';

// Gives every page its own name in the browser tab, in the history and in search results.
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} – ${APP_NAME}`;
  }, [title]);
}
