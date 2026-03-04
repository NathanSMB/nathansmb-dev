import { Show } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { requireAuth } from "~/auth/require-auth";
import Spinner from "~/components/ui/Spinner";
import "./space-invaders.css";

const SpaceInvadersGame = clientOnly(
    () => import("~/components/space-invaders/SpaceInvadersGame"),
);
const Leaderboard = clientOnly(
    () => import("~/components/space-invaders/ui/Leaderboard"),
);

export default function SpaceInvadersPage() {
    const { authorized } = requireAuth();

    return (
        <Show when={authorized()} fallback={<Spinner size="xl" center />}>
            <main class="si-page">
                <div class="si-page-game">
                    <SpaceInvadersGame />
                </div>
                <div class="si-page-sidebar">
                    <Leaderboard />
                </div>
            </main>
        </Show>
    );
}
