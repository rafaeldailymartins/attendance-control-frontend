import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { OctagonXIcon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
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
					FallbackComponent={ErrorFallback}
				>
					<Suspense fallback={<Loading />}>
						<Outlet />
					</Suspense>
				</ErrorBoundary>
			</main>
		</SidebarProvider>
	);
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
	return (
		<Empty className="w-full h-[95vh]">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<OctagonXIcon className="size-10 text-error" />
				</EmptyMedia>
				<EmptyTitle className="text-primary">
					{error?.response?.data?.detail?.message ??
						"Desculpe, ocorreu um erro no sistema"}
				</EmptyTitle>
				<EmptyDescription>
					Se o error persisistir, tente novamente mais tarde ou entre em contato
					com o suporte.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={resetErrorBoundary}>Tentar novamente</Button>
			</EmptyContent>
		</Empty>
	);
}

function Loading() {
	return (
		<Empty className="w-full h-[95vh]">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Spinner className="size-10 text-primary" />
				</EmptyMedia>
				<EmptyTitle className="text-primary">Carregando os dados...</EmptyTitle>
				<EmptyDescription>
					Por favor aguarde. Estamos preparando os dados para você.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
