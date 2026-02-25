import type { ColumnDef } from "@tanstack/react-table";
import type { AbsenceResponse } from "@/http/gen/api.schemas";
import { DataTable } from "./DataTable";

export const columns: ColumnDef<AbsenceResponse>[] = [
	{
		accessorKey: "shift.user.name",
		header: "Nome",
	},
	{
		accessorKey: "attendanceType",
		header: "Tipo",
	},
	{
		accessorKey: "timestamp",
		header: "Data/Hora",
	},
];

export function AbsencesTable() {
	return (
		<div className="container mx-auto py-10">
			<DataTable columns={columns} data={[]} />
		</div>
	);
}
