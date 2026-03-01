import { createEffect } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { authClient } from "~/utils/auth-client";

type Permissions = Record<string, string[]>;

export function requireAuth(options?: { permissions?: Permissions }) {
  const session = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();

  createEffect(async () => {
    if (session().isPending) return;

    if (!session().data) {
      const redirect = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${redirect}`, { replace: true });
      return;
    }

    if (options?.permissions) {
      const result = await authClient.admin.hasPermission({
        permissions: options.permissions,
      });

      if (!result.data?.success) {
        navigate("/forbidden", { replace: true });
      }
    }
  });

  return session;
}
