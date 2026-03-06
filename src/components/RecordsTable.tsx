import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download } from "lucide-react";
import React, { useState } from "react";
import type { AttendanceResponse, UserResponse } from "@/http/gen/api.schemas";
import { RecordsService, UsersService } from "@/http/services";
import { ATTENDANCE_TYPE_MAP } from "@/lib/utils";
import type { AttendancesSearch } from "@/routes/_private/attendances";
import { ComboboxUser } from "./ComboboxUser";
import { DataTable } from "./DataTable";
import { DatePicker } from "./DatePicker";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

const columns = {
	name: {
		accessorKey: "shift.user.name",
		header: "Nome",
	},
	weekday: {
		accessorKey: "weekday",
		header: "Dia da semana",
		accessorFn: (row) => format(row.timestamp, "EEEE", { locale: ptBR }),
	},
	shiftStart: {
		accessorKey: "shift.startTime",
		header: "Turno (Entrada)",
	},
	shiftEnd: {
		accessorKey: "shift.endTime",
		header: "Turno (Saída)",
	},
	minutesLate: {
		accessorKey: "minutesLate",
		header: "Minutos de Atraso",
		accessorFn: (row) => {
			if (!row.minutesLate) return "-";
			return row.minutesLate;
		},
	},
	attendanceType: {
		accessorKey: "attendanceType",
		header: "Tipo",
		accessorFn: (row) => {
			return ATTENDANCE_TYPE_MAP[row.attendanceType];
		},
	},
	timestamp: {
		accessorKey: "timestamp",
		header: "Data/Hora",
		accessorFn: (row) => format(row.timestamp, "dd/MM/yyyy HH:mm:ss"),
	},
} as const satisfies Record<string, ColumnDef<AttendanceResponse>>;

type ColumnKeys = keyof typeof columns;

interface Props {
	filter?: AttendancesSearch;
	onChangeFilter?: (filter: AttendancesSearch) => void;
	columnKeys?: ColumnKeys[];
	showFilters?: boolean;
}

export function RecordsTable({
	filter,
	onChangeFilter,
	columnKeys,
	showFilters,
}: Props) {
	const filteredColumns = !columnKeys
		? columns
		: Object.fromEntries(
				Object.entries(columns).filter(([key]) =>
					columnKeys.includes(key as ColumnKeys),
				),
			);

	const { data, fetchNextPage } =
		RecordsService.useListAttendancesSuspenseInfinite(
			{
				pageSize: 10,
				start_timestamp: filter?.startDate,
				end_timestamp: filter?.endDate,
				user_id: filter?.userId,
			},
			{
				query: {
					getNextPageParam: (page) =>
						page.currentPage + 1 <= page.totalPages
							? page.currentPage + 1
							: null,
				},
			},
		);
	const { data: user } = UsersService.useGetUser(filter?.userId ?? -1, {
		query: {
			enabled: !!filter?.userId,
		},
	});

	const [startDate, setStartDate] = useState<Date | undefined>(() =>
		filter?.startDate ? parseISO(filter.startDate) : undefined,
	);
	const [endDate, setEndDate] = useState<Date | undefined>(() =>
		filter?.endDate ? parseISO(filter.endDate) : undefined,
	);

	const userLabelId = React.useId();
	const startDateLabelId = React.useId();
	const endDateLabelId = React.useId();

	function handleChangeStartDate(date?: Date) {
		if (!onChangeFilter) return;
		setStartDate(date);

		onChangeFilter({
			startDate: !date ? date : format(date, "yyyy-MM-dd"),
			endDate: !endDate ? endDate : format(endDate, "yyyy-MM-dd"),
			userId: filter?.userId,
		});
	}

	function handleChangeEndDate(date?: Date) {
		if (!onChangeFilter) return;

		setEndDate(date);

		onChangeFilter({
			startDate: !startDate ? startDate : format(startDate, "yyyy-MM-dd"),
			endDate: !date ? date : format(date, "yyyy-MM-dd"),
			userId: filter?.userId,
		});
	}

	function handleChangeUser(user?: UserResponse) {
		if (!onChangeFilter) return;

		onChangeFilter({
			startDate: !startDate ? startDate : format(startDate, "yyyy-MM-dd"),
			endDate: !endDate ? endDate : format(endDate, "yyyy-MM-dd"),
			userId: user?.id,
		});
	}

	return (
		<div className="container mx-auto">
			{showFilters && (
				<div className="flex flex-row gap-5 items-end py-6">
					<div className="flex-1 space-y-1">
						<Label htmlFor={userLabelId}>Usuário</Label>
						<ComboboxUser
							id={userLabelId}
							user={user}
							onChange={handleChangeUser}
						/>
					</div>

					<div className="flex-1 space-y-1">
						<Label htmlFor={startDateLabelId}>Data Inicial</Label>
						<DatePicker
							id={startDateLabelId}
							placeHolder="Data Inicial"
							date={startDate}
							onChange={handleChangeStartDate}
						/>
					</div>

					<div className="flex-1 space-y-1">
						<Label htmlFor={endDateLabelId}>Data Final</Label>
						<DatePicker
							id={endDateLabelId}
							placeHolder="Data Final"
							date={endDate}
							onChange={handleChangeEndDate}
						/>
					</div>

					<Button className="flex-[0.6]">
						<Download />
						EXPORTAR CSV
					</Button>
				</div>
			)}

			<div className="container mx-auto py-6">
				<DataTable
					columns={Object.values(filteredColumns)}
					infiniteQuery
					nextPageFn={fetchNextPage}
					data={data?.pages ?? []}
				/>
			</div>
		</div>
	);
}
