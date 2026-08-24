import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 min  — data is considered fresh
      gcTime: 1000 * 60 * 60 * 24,    // 24 h   — keep in memory / persisted cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Guard: createSyncStoragePersister requires window.localStorage.
// In SSR / test environments without a real window this would throw,
// so fall back to a no-op storage object instead.
const storage =
  typeof window !== 'undefined' && window.localStorage
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      };

export const persister = createSyncStoragePersister({
  storage,
  key: 'AIRIS_OFFLINE_CACHE',
});
