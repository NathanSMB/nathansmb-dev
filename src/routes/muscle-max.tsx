import { clientOnly } from "@solidjs/start";
import { Title } from "@solidjs/meta";
import "./muscle-max.css";

const MuscleViewer = clientOnly(
    () => import("~/components/muscles/MuscleViewer"),
);

export default function MuscleMaxPage() {
    return (
        <main class="muscle-max-page">
            <Title>Muscle Max</Title>
            <MuscleViewer />
        </main>
    );
}
