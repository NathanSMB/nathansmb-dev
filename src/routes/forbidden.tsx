import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";

export default function Forbidden() {
  return (
    <main>
      <Title>Forbidden</Title>
      <HttpStatusCode code={403} />
      <h1>Forbidden</h1>
      <p>
        You don't have permission to access this page.{" "}
        <a href="/">Go home</a>
      </p>
    </main>
  );
}
