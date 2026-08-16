import { useEffect, useState } from "react";
import { fontLoadSpecs } from "./theme";

// Show the frame anyway if the Font Loading API stalls. A brief swap is a
// smaller failure than content that never appears.
const TIMEOUT_MS = 2500;

// One shared promise per spec list, so each set of faces is fetched once per
// page no matter how many frames the page renders.
const pending = new Map<string, Promise<void>>();

function loadFonts(specs: readonly string[]): Promise<void> {
    const key = specs.join("|");
    const existing = pending.get(key);
    if (existing) return existing;
    const promise = (async () => {
        if (typeof document === "undefined" || !document.fonts) return;
        // Explicit loads rather than `document.fonts.ready`: while the frame
        // is faded out the browser may never consider these faces used, and
        // `ready` resolves immediately when nothing is pending.
        await Promise.allSettled(specs.map((spec) => document.fonts.load(spec)));
    })();
    pending.set(key, promise);
    return promise;
}

// True once the DSL's fonts are available, so text never reflows from
// fallback metrics in view. Pass `extraSpecs` (e.g. `katexFontLoadSpecs`)
// when the frame renders `Math`.
export function useFontsReady(extraSpecs: readonly string[] = []): boolean {
    const [ready, setReady] = useState(false);
    const specs = [...fontLoadSpecs, ...extraSpecs];
    const specsKey = specs.join("|");

    useEffect(() => {
        let cancelled = false;
        const done = () => {
            if (!cancelled) setReady(true);
        };
        const timer = setTimeout(done, TIMEOUT_MS);
        loadFonts(specs).then(() => {
            clearTimeout(timer);
            done();
        });
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [specsKey]);

    return ready;
}
