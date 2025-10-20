import { createRootRoute, Outlet } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { MainService } from "@/http/services";

const loadDevtools = () =>
	Promise.all([
		import("@tanstack/react-devtools"),
		import("@tanstack/react-router-devtools"),
		import("@tanstack/react-query-devtools"),
	]).then(([reactDevtools, reactRouterDevtools, reactQueryDevtools]) => {
		return {
			default: () => (
				<>
					<reactDevtools.TanStackDevtools />
					<reactRouterDevtools.TanStackRouterDevtools />
					<reactQueryDevtools.ReactQueryDevtools buttonPosition="top-right" />
				</>
			),
		};
	});

const TanStackDevtools = import.meta.env.PROD
	? () => null
	: React.lazy(loadDevtools);

export const Route = createRootRoute({
	component: Root,
});

function Root() {
	MainService.useHealthCheck();

	return (
		<>
			<Outlet />
			<Toaster />
			<Suspense>
				<TanStackDevtools />
			</Suspense>
		</>
	);
}
