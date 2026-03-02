import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import z from "zod";
import { AbsencesTable } from "@/components/AbsencesTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const absencesSearchSchema = z.object({
	startDate: z.iso.date().catch(format(subDays(new Date(), 30), "yyyy-MM-dd")),
	endDate: z.iso.date().catch(format(new Date(), "yyyy-MM-dd")),
	userId: z.number().optional(),
});

export type AbsencesSearch = z.infer<typeof absencesSearchSchema>;

export const Route = createFileRoute("/_private/absences")({
	component: AbsencesPage,
	validateSearch: absencesSearchSchema,
});

function AbsencesPage() {
	const searchParams = Route.useSearch();
	const navigate = Route.useNavigate();

	function onChangeFilter(filter: AbsencesSearch) {
		navigate({
			search: () => filter,
		});
	}

	return (
		<div className="grid p-4 h-[95vh]">
			<Card>
				<CardHeader>
					<CardTitle className="font-semibold text-primary text-3xl">
						Relatório de Faltas
					</CardTitle>
				</CardHeader>
				<CardContent>
					<AbsencesTable
						filter={searchParams}
						onChangeFilter={onChangeFilter}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
