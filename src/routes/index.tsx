import { Title } from "@solidjs/meta";
import Counter from "~/components/Counter";
import { connection } from "~/database/connection";
import { tempTable } from "~/database/schema";

async function logTempTable() {
  "use server"
  const users = await connection.select().from(tempTable);
  console.log(users);
}

export default function Home() {
  logTempTable();
  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      <Counter />
      <p>
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  );
}
