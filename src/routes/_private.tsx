import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isLoggedIn } from "@/lib/utils";

export const Route = createFileRoute("/_private")({
	component: Layout,
	beforeLoad: () => {
		if (!isLoggedIn()) {
			throw redirect({
				to: "/login",
			});
		}
	},
});

function Layout() {
	return <Outlet />;
}
