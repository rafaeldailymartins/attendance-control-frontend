import type { ColumnDef } from "@tanstack/react-table";
import type { AttendanceResponse } from "@/http/gen/api.schemas";
import { RecordsService } from "@/http/services";
import { ATTENDANCE_TYPE_MAP } from "@/lib/utils";
import { DataTable } from "./DataTable";

export const columns: ColumnDef<AttendanceResponse>[] = [
	{
		accessorKey: "shift.user.name",
		header: "Nome",
	},
	{
		accessorKey: "attendanceType",
		header: "Tipo",
		accessorFn: (row) => {
			return ATTENDANCE_TYPE_MAP[row.attendanceType];
		},
	},
	{
		accessorKey: "timestamp",
		header: "Data/Hora",
		accessorFn: (row) => {
			const date = new Date(row.timestamp);
			return date.toLocaleString("pt-BR").replace(",", "");
		},
	},
];

export function RecordsTable() {
	const { data, fetchNextPage } =
		RecordsService.useListAttendancesSuspenseInfinite(
			{ pageSize: 10 },
			{
				query: {
					getNextPageParam: (page) =>
						page.currentPage + 1 <= page.totalPages
							? page.currentPage + 1
							: null,
				},
			},
		);

	return (
		<div className="container mx-auto py-10">
			<DataTable
				columns={columns}
				infiniteQuery
				nextPageFn={fetchNextPage}
				data={data?.pages ?? []}
			/>
		</div>
	);
}
