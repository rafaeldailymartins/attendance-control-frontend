import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { AppSidebar } from "@/components/AppSidebar";
import { ErrorFallback } from "@/components/ErrorFallback";
import { Loading } from "@/components/Loading";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { isLoggedIn } from "@/lib/utils";
import { queryClient } from "@/queryClient";

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
				<ErrorBoundary
					onReset={() => {
						queryClient.resetQueries();
					}}
					FallbackComponent={FallBack}
				>
					<Suspense fallback={<Loading className="w-full h-[95vh]" />}>
						<Outlet />
					</Suspense>
				</ErrorBoundary>
			</main>
		</SidebarProvider>
	);
}

function FallBack(props: FallbackProps) {
	return <ErrorFallback {...props} className="w-full h-[95vh]" />;
}
