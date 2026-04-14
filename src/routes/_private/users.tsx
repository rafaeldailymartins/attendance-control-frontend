import { createFileRoute } from "@tanstack/react-router";
import { UsersTable } from "@/components/UsersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_private/users")({
	component: UsersPage,
});

function UsersPage() {
	return (
		<div className="grid p-4 h-[95vh]">
			<Card>
				<CardHeader>
					<CardTitle className="font-semibold text-primary text-3xl">
						Usuários Cadastrados
					</CardTitle>
				</CardHeader>
				<CardContent>
					<UsersTable />
				</CardContent>
			</Card>
		</div>
	);
}
