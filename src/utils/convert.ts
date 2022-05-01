import type { Readable } from "stream";

export const addTargetTop = (input: string) => {
  let start = null;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === "a" && input[i - 1] === "<") {
      start = i;
    }

    if (start !== null && input[i] === ">") {
      const insertable = ' target="_top"';
      input = input.slice(0, start + 1) + insertable + input.slice(start + 1);
      i += insertable.length;
      start = null;
    }
  }

  return input;
};

export const toReadableStream = (stream: Readable): Promise<ReadableStream> => {
  return new Promise((resolve, reject) => {
    var readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        stream.on("error", reject);
        stream.on("end", () => {
          controller.close();
          resolve(readable);
        });
      },
    });
  });
};

export const toBuffer = async (stream: ReadableStream): Promise<Buffer> => {
  const reader = stream.getReader();
  const chunks: Buffer[] = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      reader.releaseLock();
      return Buffer.concat(chunks);
    }

    chunks.push(value);
  }
};

export const convertStreamToString = async (
  stream: ReadableStream
): Promise<string> => {
  return (await toBuffer(stream)).toString("utf8");
};
