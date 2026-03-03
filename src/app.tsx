import { MetaProvider, Title } from "@solidjs/meta";
import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Show, Suspense } from "solid-js";
import { authClient } from "~/auth/auth-client";
import Avatar from "~/components/ui/Avatar";
import "./app.css";
import Button from "./components/ui/Button";

export default function App() {
  return (
    <Router
      root={(props) => {
        const session = authClient.useSession();
        const location = useLocation();

        return (
          <MetaProvider>
            <Title>SolidStart - Basic</Title>
            <header>
              <nav>
                <a href="/">Home</a>
                <a href="/about">About</a>
              </nav>
              <div class="auth-controls">
                <Show when={!session().isPending}>
                  <Show
                    when={session().data}
                    fallback={<a href={`/login?redirect=${encodeURIComponent(location.pathname)}`}>Log in</a>}
                  >
                    {(s) => (
                      <>
                        <Avatar image={s().user.image} name={s().user.name} />
                        <span>{s().user.name}</span>
                        <Show when={s().user.role === "admin"}>
                          <a href="/admin">Admin</a>
                        </Show>
                        <a href="/settings/profile">Settings</a>
                        <Button onClick={() => authClient.signOut()}>
                          Log out
                        </Button>
                      </>
                    )}
                  </Show>
                </Show>
              </div>
            </header>
            <Suspense>{props.children}</Suspense>
          </MetaProvider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
