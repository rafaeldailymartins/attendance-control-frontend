import type { ColumnDef } from "@tanstack/react-table";
import { differenceInDays, format, parseISO } from "date-fns";
import { Download } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { AbsenceResponse, UserResponse } from "@/http/gen/api.schemas";
import { RecordsService, UsersService } from "@/http/services";
import { ATTENDANCE_TYPE_MAP } from "@/lib/utils";
import type { AbsencesSearch } from "@/routes/_private/absences";
import { ComboboxUser } from "./ComboboxUser";
import { DataTable } from "./DataTable";
import { DatePicker } from "./DatePicker";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

export const columns: ColumnDef<AbsenceResponse>[] = [
	{
		accessorKey: "shift.user.name",
		header: "Nome",
	},
	{
		accessorKey: "day",
		header: "Data",
		accessorFn: (row) => format(row.day, "dd-MM-yyyy HH:mm:ss"),
	},
	{
		accessorKey: "shift.startTime",
		header: "Turno (Entrada)",
	},
	{
		accessorKey: "shift.endTime",
		header: "Turno (Saída)",
	},
	{
		accessorKey: "absenceType",
		header: "Tipo",
		accessorFn: (row) => {
			return ATTENDANCE_TYPE_MAP[row.absenceType];
		},
	},
	{
		accessorKey: "minutesLate",
		header: "Minutos de Atraso",
		accessorFn: (row) => {
			if (!row.minutesLate) return "-";
			return row.minutesLate;
		},
	},
	{
		accessorKey: "attendanceTimestamp",
		header: "Data/Hora da Presença",
		accessorFn: (row) => {
			if (!row.attendanceTimestamp) return "-";
			return format(row.attendanceTimestamp, "dd-MM-yyyy HH:mm:ss");
		},
	},
];

interface Props {
	filter: AbsencesSearch;
	onChangeFilter: (filter: AbsencesSearch) => void;
}

export function AbsencesTable({ filter, onChangeFilter }: Props) {
	const { data } = RecordsService.useListAbsencesSuspense({
		start_date: filter.startDate,
		end_date: filter.endDate,
		user_id: filter.userId,
	});
	const { data: user } = UsersService.useGetUser(filter.userId ?? -1, {
		query: {
			enabled: !!filter.userId,
		},
	});

	const [startDate, setStartDate] = useState<Date | undefined>(
		parseISO(filter.startDate),
	);
	const [endDate, setEndDate] = useState<Date | undefined>(
		parseISO(filter.endDate),
	);

	const userLabelId = React.useId();
	const startDateLabelId = React.useId();
	const endDateLabelId = React.useId();

	function handleChangeStartDate(date?: Date) {
		if (!date || !endDate) {
			toast.warning("Selecione uma data válida");
			return;
		}

		if (date > endDate) {
			toast.warning("A data inicial não pode ser maior que a data final");
			return;
		}

		if (differenceInDays(endDate, date) > 90) {
			toast.warning("O período entre as datas deve ser menor que 90 dias.");
			return;
		}

		setStartDate(date);

		onChangeFilter({
			startDate: format(date, "yyyy-MM-dd"),
			endDate: format(endDate, "yyyy-MM-dd"),
			userId: filter.userId,
		});
	}

	function handleChangeEndDate(date?: Date) {
		if (!startDate || !date) {
			toast.warning("Selecione uma data válida");
			return;
		}

		if (startDate > date) {
			toast.warning("A data inicial não pode ser maior que a data final");
			return;
		}

		if (differenceInDays(date, startDate) > 90) {
			toast.warning("O período entre as datas deve ser menor que 90 dias.");
			return;
		}

		setEndDate(date);

		onChangeFilter({
			startDate: format(startDate, "yyyy-MM-dd"),
			endDate: format(date, "yyyy-MM-dd"),
			userId: filter.userId,
		});
	}

	function handleChangeUser(user?: UserResponse) {
		if (!startDate || !endDate) {
			toast.warning("Selecione uma data válida");
			return;
		}

		onChangeFilter({
			startDate: format(startDate, "yyyy-MM-dd"),
			endDate: format(endDate, "yyyy-MM-dd"),
			userId: user?.id,
		});
	}

	return (
		<div className="py-6">
			<div className="flex flex-row gap-5 items-end">
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
			<div className="container mx-auto py-6">
				<DataTable columns={columns} data={data} />
			</div>
		</div>
	);
}
