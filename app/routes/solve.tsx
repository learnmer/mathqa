import { LoaderFunctionArgs } from "@vercel/remix";
import { solveStream } from "../lib/gemini";
import { eventStream } from "remix-utils/sse/server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const problem = decodeURIComponent(url.searchParams.get("problem") || "");
  if (!problem) return "";

  const response = await solveStream(problem);
  return eventStream(request.signal, function setup(send) {
    (async () => {
      for await (const chunk of response) {
        const chunkText = chunk.text();
        send({ data: JSON.stringify(chunkText) });
      }
      // close the stream
      send({ data: "", event: "close" });
    })();

    return function clear() {};
  });
}
