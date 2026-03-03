import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";

export default function NotFound() {
    return (
        <main>
            <Title>Not Found</Title>
            <HttpStatusCode code={404} />
            <h1>Page Not Found</h1>
            <p>
                If you had spun out in your oldsmobile this probably wouldn't have happened.
            </p>
        </main>
    );
}
