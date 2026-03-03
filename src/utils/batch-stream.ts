interface BatchProgress {
  completed: number;
  total: number;
}

interface BatchDone {
  succeededIds: string[];
  failedCount: number;
}

export async function consumeBatchStream(
  url: string,
  body: Record<string, unknown>,
  onProgress: (progress: BatchProgress) => void,
  onDone: (result: BatchDone) => void,
  onError: (message: string) => void,
) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      onError(await response.text());
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop()!;

      for (const line of lines) {
        const match = line.match(/^data: (.+)$/m);
        if (!match) continue;

        const data = JSON.parse(match[1]);
        if (data.done) {
          onDone({ succeededIds: data.succeededIds, failedCount: data.failedCount });
        } else {
          onProgress({ completed: data.completed, total: data.total });
        }
      }
    }
  } catch {
    onError("Connection lost during batch operation");
  }
}
