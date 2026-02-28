import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Show, Suspense } from "solid-js";
import { authClient } from "~/utils/auth-client";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => {
        const session = authClient.useSession();

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
                    fallback={<a href="/login">Log in</a>}
                  >
                    {(s) => (
                      <>
                        <span>{s().user.name}</span>
                        <button onClick={() => authClient.signOut()}>
                          Log out
                        </button>
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
