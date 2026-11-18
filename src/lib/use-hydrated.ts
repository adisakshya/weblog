import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false while the server-rendered HTML is being hydrated, true afterwards (and always true for pages mounted by
 * client-side navigation). Use it for state that is read from the URL/storage but is not part of the prerendered HTML,
 * so the first client render matches the static markup (React error #418) and the real state is applied right after.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
