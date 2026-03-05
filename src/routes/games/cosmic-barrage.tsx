import { clientOnly } from "@solidjs/start";
import "./cosmic-barrage.css";

const CosmicBarrageGame = clientOnly(
    () => import("~/components/cosmic-barrage/CosmicBarrageGame"),
);
const Leaderboard = clientOnly(
    () => import("~/components/cosmic-barrage/ui/Leaderboard"),
);

export default function CosmicBarragePage() {
    return (
        <main class="cb-page">
            <div class="cb-page-game">
                <CosmicBarrageGame />
            </div>
            <div class="cb-page-sidebar">
                <Leaderboard />
            </div>
        </main>
    );
}
