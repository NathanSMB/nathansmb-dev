import { Show } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { requireAuth } from "~/auth/require-auth";
import Spinner from "~/components/ui/Spinner";
import "./cosmic-barrage.css";

const CosmicBarrageGame = clientOnly(
    () => import("~/components/cosmic-barrage/CosmicBarrageGame"),
);
const Leaderboard = clientOnly(
    () => import("~/components/cosmic-barrage/ui/Leaderboard"),
);

export default function CosmicBarragePage() {
    const { authorized } = requireAuth();

    return (
        <Show when={authorized()} fallback={<Spinner size="xl" center />}>
            <main class="cb-page">
                <div class="cb-page-game">
                    <CosmicBarrageGame />
                </div>
                <div class="cb-page-sidebar">
                    <Leaderboard />
                </div>
            </main>
        </Show>
    );
}
