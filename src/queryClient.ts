import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { handleApiError } from "./lib/utils";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
	queryCache: new QueryCache({
		onError: handleApiError,
	}),
	mutationCache: new MutationCache({
		onError: handleApiError,
	}),
});
