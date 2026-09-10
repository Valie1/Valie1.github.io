"use client";

import { useEffect } from "react";
import { showError } from "@/lib/feedback";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    showError("That page could not be loaded. Please try again.", { title: "PAGE ERROR", duration: 5200 });
  }, [error]);

  return (
    <main className="simple-system-state">
      <p className="simple-system-code">ERROR</p>
      <h1>Something went wrong.</h1>
      <p>That page could not be loaded. You can try it again.</p>
      <button type="button" onClick={reset}>TRY AGAIN</button>
    </main>
  );
}
