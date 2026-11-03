import { useEffect, useState } from 'react';

/**
 * False during the static (pre-rendered) render and the first client render,
 * true after mount. Use it for anything that depends on the URL query string,
 * which the pre-rendered HTML cannot know.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
