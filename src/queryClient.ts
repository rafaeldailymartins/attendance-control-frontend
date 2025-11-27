import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { handleApiError } from "./lib/utils";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: handleApiError,
	}),
	mutationCache: new MutationCache({
		onError: handleApiError,
	}),
});
