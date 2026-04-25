import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { type Dispatch, useId, useState } from "react";
import { toast } from "sonner";
import { Combobox } from "@/components/Combobox";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CreateDayOffDialog } from "@/components/CreateDayOffDialog";
import { CreateRoleDialog } from "@/components/CreateRoleDialog";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import { useUpdateEffect } from "@/hooks/useUpdateEffect";
import type {
	AppConfigUpdate,
	DayOffResponse,
	RoleResponse,
} from "@/http/gen/api.schemas";
import { ConfigService } from "@/http/services";
import { queryClient } from "@/queryClient";

export const Route = createFileRoute("/_private/config")({
	component: ConfigPage,
});

function ConfigPage() {
	const { mutateAsync: updateAppConfig } = ConfigService.useUpdateAppConfig({
		mutation: {
			onMutate: () => {
				const toastId = toast.loading("Atualizadno...");
				return { toastId };
			},
			onSuccess: () => {
				toast.success("Configuração atualizada com sucesso");

				queryClient.invalidateQueries({
					queryKey: ConfigService.getGetAppConfigQueryKey(),
				});
			},
			onSettled: (_data, _error, _variables, res) => {
				toast.dismiss(res?.toastId);
			},
		},
	});

	return (
		<div className="grid p-4 h-[95vh]">
			<Card>
				<CardHeader>
					<CardTitle className="font-semibold text-primary text-3xl">
						Configurações
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-x-4 gap-y-8">
						<TimeThreshold update={updateAppConfig} />
						<Times update={updateAppConfig} />
						<DaysOff />
						<Roles />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function TimeThreshold({
	update,
}: {
	update: ({ data }: { data: AppConfigUpdate }) => void;
}) {
	const minutesLateLabelId = useId();
	const minutesEarlyLabelId = useId();

	const { data: appConfig } = ConfigService.useGetAppConfigSuspense();
	const [minutesEarly, setMinutesEarly] = useState(appConfig.minutesEarly);
	const [minutesLate, setMinutesLate] = useState(appConfig.minutesLate);

	const { debouncedValue: debouncedMinutesEarly } = useDebounce(
		minutesEarly,
		500,
	);
	const { debouncedValue: debouncedMinutesLate } = useDebounce(
		minutesLate,
		500,
	);

	useUpdateEffect(() => {
		const data: AppConfigUpdate = {
			minutesEarly: debouncedMinutesEarly,
		};
		update({ data });
	}, [debouncedMinutesEarly]);

	useUpdateEffect(() => {
		const data: AppConfigUpdate = {
			minutesLate: debouncedMinutesLate,
		};
		update({ data });
	}, [debouncedMinutesLate]);

	function handleNumberChange(setter: Dispatch<React.SetStateAction<number>>) {
		return (event: React.ChangeEvent<HTMLInputElement>) => {
			const value = parseInt(event.target.value, 10);
			if (!Number.isNaN(value)) setter(value);
		};
	}

	return (
		<div>
			<h2 className="text-xl font-medium mb-5">Tempo Limite</h2>
			<div className="flex flex-col gap-5">
				<div className="flex-1 space-y-2">
					<Label htmlFor={minutesEarlyLabelId}>
						Limite de Adiantamento (Minutos)
					</Label>
					<Input
						id={minutesEarlyLabelId}
						value={minutesEarly}
						onChange={handleNumberChange(setMinutesEarly)}
						className="max-w-md"
						type="number"
						min="0"
						step="1"
					/>
				</div>
				<div className="flex-1 space-y-2">
					<Label htmlFor={minutesLateLabelId}>Limite de Atraso (Minutos)</Label>
					<Input
						id={minutesLateLabelId}
						value={minutesLate}
						onChange={handleNumberChange(setMinutesLate)}
						className="max-w-md"
						type="number"
						min="0"
						step="1"
					/>
				</div>
			</div>
		</div>
	);
}

function Times({
	update,
}: {
	update: ({ data }: { data: AppConfigUpdate }) => void;
}) {
	const zoneInfoLabelId = useId();

	const { data: timezones } = ConfigService.useListTimezonesSuspense();
	const { data: appConfig } = ConfigService.useGetAppConfigSuspense();
	const [zoneInfo, setzoneInfo] = useState<string | undefined>(
		appConfig.zoneInfo,
	);

	const { debouncedValue } = useDebounce(zoneInfo, 500);

	useUpdateEffect(() => {
		const data: AppConfigUpdate = {
			zoneInfo: debouncedValue,
		};
		update({ data });
	}, [debouncedValue]);

	return (
		<div>
			<h2 className="text-xl font-medium mb-5">Horários</h2>
			<div className="flex flex-col gap-5">
				<div className="flex-1 space-y-2">
					<Label htmlFor={zoneInfoLabelId}>Fuso Horário</Label>
					<Combobox
						value={zoneInfo}
						className="max-w-md cursor-pointer"
						onChange={setzoneInfo}
						items={timezones.map((tz) => ({
							value: tz.zoneInfo,
							label: `${tz.offset} ${tz.zoneInfo}`,
						}))}
					/>
				</div>
			</div>
		</div>
	);
}

const daysOffColumns: ColumnDef<DayOffResponse>[] = [
	{
		accessorKey: "day",
		header: "Dia",
	},
	{
		accessorKey: "description",
		header: "Descrição",
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const { mutateAsync: deleteDayOff } = ConfigService.useDeleteDayOff({
				mutation: {
					onMutate: () => {
						const toastId = toast.loading("Removendo...");
						return { toastId };
					},
					onSuccess: () => {
						toast.success("Dia livre removido com sucesso");

						queryClient.invalidateQueries({
							queryKey: ConfigService.getListDaysOffInfiniteQueryKey(),
						});
					},
					onSettled: (_data, _error, _variables, res) => {
						toast.dismiss(res?.toastId);
					},
				},
			});

			async function handleDelete() {
				await deleteDayOff({ dayOffId: row.original.id });
			}

			return (
				<div className="flex justify-end pr-8">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Abrir menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Ações</DropdownMenuLabel>
							<ConfirmDialog onConfirm={handleDelete}>
								<DropdownMenuItem
									className="cursor-pointer"
									onSelect={(e) => e.preventDefault()}
								>
									Excluir
								</DropdownMenuItem>
							</ConfirmDialog>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];

function DaysOff() {
	const { data, fetchNextPage } = ConfigService.useListDaysOffSuspenseInfinite(
		{
			pageSize: 5,
		},
		{
			query: {
				getNextPageParam: (page) =>
					page.currentPage + 1 <= page.totalPages ? page.currentPage + 1 : null,
			},
		},
	);

	return (
		<div>
			<h2 className="text-xl font-medium mb-5">Dias Livres e Feriados</h2>
			<div className="flex flex-col gap-2">
				<div className="flex-1 space-y-2">
					<CreateDayOffDialog>
						<Button>
							<Plus /> ADICIONAR
						</Button>
					</CreateDayOffDialog>
				</div>
				<div className="flex-1 space-y-2">
					<DataTable
						columns={daysOffColumns}
						pageSize={5}
						infiniteQuery
						nextPageFn={fetchNextPage}
						data={data?.pages ?? []}
					/>
				</div>
			</div>
		</div>
	);
}

const rolesColumns: ColumnDef<RoleResponse>[] = [
	{
		accessorKey: "name",
		header: "Descrição",
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const { mutateAsync: deleteRole } = ConfigService.useDeleteRole({
				mutation: {
					onMutate: () => {
						const toastId = toast.loading("Removendo...");
						return { toastId };
					},
					onSuccess: () => {
						toast.success("Cargo removido com sucesso");

						queryClient.invalidateQueries({
							queryKey: ConfigService.getListRolesQueryKey(),
						});
					},
					onSettled: (_data, _error, _variables, res) => {
						toast.dismiss(res?.toastId);
					},
				},
			});

			async function handleDelete() {
				await deleteRole({ roleId: row.original.id });
			}

			return (
				<div className="flex justify-end pr-8">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Abrir menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Ações</DropdownMenuLabel>
							<ConfirmDialog onConfirm={handleDelete}>
								<DropdownMenuItem
									className="cursor-pointer"
									onSelect={(e) => e.preventDefault()}
								>
									Excluir
								</DropdownMenuItem>
							</ConfirmDialog>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];

function Roles() {
	const { data } = ConfigService.useListRolesSuspense();

	return (
		<div>
			<h2 className="text-xl font-medium mb-5">Cargos</h2>
			<div className="flex flex-col gap-2">
				<div className="flex-1 space-y-2">
					<CreateRoleDialog>
						<Button>
							<Plus /> ADICIONAR
						</Button>
					</CreateRoleDialog>
				</div>
				<div className="flex-1 space-y-2">
					<DataTable columns={rolesColumns} pageSize={5} data={data} />
				</div>
			</div>
		</div>
	);
}
