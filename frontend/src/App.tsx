import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "./routes/router";

function App() {
    return (
        <Suspense
            fallback={
                <main
                    className="flex min-h-screen items-center justify-center bg-canvas text-sm text-ink-500"
                    role="status"
                    aria-live="polite"
                >
                    Loading page…
                </main>
            }
        >
            <RouterProvider router={router} />
        </Suspense>
    );
}

export default App;
