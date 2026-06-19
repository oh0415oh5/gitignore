import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { useAuth } from "@workos-inc/authkit-react";
import { useCallback, useMemo, type ReactNode } from "react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const { isLoading, user, getAccessToken } = useAuth();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      return (await getAccessToken({ forceRefresh: forceRefreshToken })) ?? null;
    },
    [getAccessToken],
  );

  const useAuthForConvex = useMemo(
    () => () => ({
      isLoading,
      isAuthenticated: !!user,
      fetchAccessToken,
    }),
    [isLoading, user, fetchAccessToken],
  );

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthForConvex}>
      {children}
    </ConvexProviderWithAuth>
  );
}
