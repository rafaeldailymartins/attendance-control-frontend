import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./styles.css";
import { AxiosError } from "axios";
import { toast } from "sonner";
import reportWebVitals from "./reportWebVitals.ts";

const handleApiError = (error: Error) => {
	const DEFAULT_MESSAGE =
		"Ocorreu um erro no servidor. Tente novamente mais tarde.";

	if (!(error instanceof AxiosError)) {
		toast.error("Ocorreu um erro no sistema. tente novamente mais tarde.");
		return;
	}

	const message = error.response?.data?.detail?.message;

	if (error.code === "ERR_NETWORK") {
		toast.warning(
			"No momento nossos servidores estão passando por instabilidade. Tente novamente mais tarde.",
			{
				duration: 8000,
			},
		);
		return;
	}

	if (!error.status || !message) {
		toast.error(DEFAULT_MESSAGE);
		return;
	}

	if (error.status >= 500) {
		toast.error(message);
	}
};
const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: handleApiError,
	}),
	mutationCache: new MutationCache({
		onError: handleApiError,
	}),
});

// Create a new router instance
const router = createRouter({
	routeTree,
	context: { queryClient },
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
