import { createRootRoute, Outlet } from "@tanstack/react-router";
import React, { Suspense } from "react";

const loadDevtools = () =>
	Promise.all([
		import("@tanstack/react-devtools"),
		import("@tanstack/react-router-devtools"),
	]).then(([reactDevtools, reactRouterDevtools]) => {
		return {
			default: () => (
				<>
					<reactDevtools.TanStackDevtools />
					<reactRouterDevtools.TanStackRouterDevtools />
				</>
			),
		};
	});

const TanStackDevtools = import.meta.env.PROD
	? () => null
	: React.lazy(loadDevtools);

export const Route = createRootRoute({
	component: () => (
		<>
			<Outlet />
			<Suspense>
				<TanStackDevtools />
			</Suspense>
		</>
	),
});
