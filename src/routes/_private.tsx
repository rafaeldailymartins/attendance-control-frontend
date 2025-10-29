import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="bg-background w-full">
				<SidebarTrigger />
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
