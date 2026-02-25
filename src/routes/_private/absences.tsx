import { createFileRoute } from "@tanstack/react-router";
import { AbsencesTable } from "@/components/AbsencesTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_private/absences")({
	component: AbsencesPage,
});

function AbsencesPage() {
	return (
		<div className="grid p-4 h-[95vh]">
			<Card>
				<CardHeader>
					<CardTitle className="font-semibold text-primary text-3xl">
						Relatório de Faltas
					</CardTitle>
				</CardHeader>
				<CardContent>
					<AbsencesTable />
				</CardContent>
			</Card>
		</div>
	);
}
