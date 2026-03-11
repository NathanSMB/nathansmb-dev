import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/nav/Nav";
import Spinner from "~/components/ui/Spinner";
import "./app.css";

export default function App() {
    return (
        <Router
            root={(props) => {
                return (
                    <MetaProvider>
                        <Title>NathanSMB</Title>
                        <div class="app-layout">
                            <Nav />
                            <Suspense fallback={<Spinner size="xl" center />}>
                                {props.children}
                            </Suspense>
                        </div>
                    </MetaProvider>
                );
            }}
        >
            <FileRoutes />
        </Router>
    );
}
