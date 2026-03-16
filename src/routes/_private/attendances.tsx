import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { RecordsTable } from "@/components/RecordsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const attendancesSearchSchema = z.object({
	startDate: z.iso.date().optional(),
	endDate: z.iso.date().optional(),
	userId: z.number().optional(),
});

export type AttendancesSearch = z.infer<typeof attendancesSearchSchema>;

export const Route = createFileRoute("/_private/attendances")({
	component: AttendancesPage,
	validateSearch: attendancesSearchSchema,
});

function AttendancesPage() {
	const searchParams = Route.useSearch();
	const navigate = Route.useNavigate();

	function onChangeFilter(filter: AttendancesSearch) {
		navigate({
			search: () => filter,
		});
	}

	return (
		<div className="grid p-4 h-[95vh]">
			<Card>
				<CardHeader>
					<CardTitle className="font-semibold text-primary text-3xl">
						Registro de Presenças
					</CardTitle>
				</CardHeader>
				<CardContent>
					<RecordsTable
						filter={searchParams}
						onChangeFilter={onChangeFilter}
						showFilters
					/>
				</CardContent>
			</Card>
		</div>
	);
}
