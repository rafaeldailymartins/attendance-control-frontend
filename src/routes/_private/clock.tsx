import { Dialog } from "@radix-ui/react-dialog";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock } from "@/components/Clock";
import { ComboboxUser } from "@/components/ComboboxUser";
import { RecordsTable } from "@/components/RecordsTable";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type AttendanceCreate,
	AttendanceType,
	type UserResponse,
} from "@/http/gen/api.schemas";
import { RecordsService, ShiftsService, UsersService } from "@/http/services";
import { formatShift } from "@/lib/utils";

export const Route = createFileRoute("/_private/clock")({
	component: ClockPage,
});

function ClockPage() {
	const [user, setUser] = useState<UserResponse>();
	const [type, setType] = useState("");

	return (
		<div className="grid grid-cols-2 gap-4 p-4 h-[95vh]">
			<Card className="px-9 justify-center">
				<CardHeader>
					<CardTitle className="font-semibold text-center text-primary text-4xl">
						Sistema de Controle de Presença
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center">
					<Clock className="text-7xl text-primary" />
				</CardContent>
				<CardFooter className="flex-col gap-2 w-full">
					<ComboboxUser user={user} onChange={setUser} />
					<Select value={type} onValueChange={setType}>
						<SelectTrigger className="w-full max-w-sm">
							<SelectValue placeholder="Selecionar tipo..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="0">Entrada</SelectItem>
							<SelectItem value="1">Saída</SelectItem>
						</SelectContent>
					</Select>
					<Dialog>
						<DialogTrigger asChild>
							<Button disabled={!user || !type} className="w-full max-w-sm">
								Bater Ponto
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							{user && <ClockDialogContent user={user} initialType={type} />}
						</DialogContent>
					</Dialog>
				</CardFooter>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="font-semibold text-primary text-3xl">
						Registros de Presença
					</CardTitle>
				</CardHeader>
				<CardContent>
					<RecordsTable />
				</CardContent>
			</Card>
		</div>
	);
}

function ClockDialogContent({
	user,
	initialType,
}: {
	user: UserResponse;
	initialType: string;
}) {
	const [shift, setShift] = useState("");
	const [confirmType, setConfirmType] = useState(initialType);

	const { data: shifts } = UsersService.useListUserShifts(user.id);

	const attendance_type =
		initialType === "1" ? AttendanceType.NUMBER_1 : AttendanceType.NUMBER_0;
	const { data: currentShift } = ShiftsService.useGetCurrentShift({
		user_id: user.id,
		attendance_type: attendance_type,
	});
	const { mutateAsync: createAttendance, isPending } =
		RecordsService.useCreateNewAttendance({
			mutation: {
				onMutate: () => {
					const toastId = toast.loading("Batendo ponto...");
					return { toastId };
				},
				onSettled: (_data, _error, _variables, res) => {
					toast.dismiss(res?.toastId);
				},
				onSuccess: (_data, _variables, _res, context) => {
					toast.success("Você bateu o ponto com sucesso!");
					context.client.invalidateQueries({
						queryKey: RecordsService.getListAttendancesInfiniteQueryKey(),
					});
				},
			},
		});

	async function submit() {
		const shiftId = parseInt(shift, 10);
		if (Number.isNaN(shiftId)) return;

		const data: AttendanceCreate = {
			attendanceType:
				confirmType === "1" ? AttendanceType.NUMBER_1 : AttendanceType.NUMBER_0,
			shiftId: shiftId,
		};
		await createAttendance({ data });
	}

	useEffect(() => {
		if (currentShift?.shift) setShift(currentShift?.shift?.id.toString());
	}, [currentShift]);

	return (
		<>
			<DialogHeader>
				<DialogTitle>Confirmar turno</DialogTitle>
				<DialogDescription>
					{currentShift?.shift
						? `O seu turno atual é: ${formatShift(currentShift.shift)}`
						: "Selecione o turno que deseja bater o ponto"}
				</DialogDescription>
				{!currentShift?.shift && (
					<DialogDescription className="text-xs text-warning">
						<b>Atenção:</b>{" "}
						{currentShift?.message || "Não foi possível obter o turno atual"}
					</DialogDescription>
				)}

				{currentShift?.shift && currentShift.shift.id.toString() !== shift && (
					<DialogDescription className="text-xs text-warning">
						<b>Atenção:</b> O turno selecionado não corresponde ao seu turno
						atual
					</DialogDescription>
				)}
			</DialogHeader>
			<div className="flex flex-col gap-2">
				<Select value={shift} onValueChange={setShift}>
					<SelectTrigger className="w-full max-w-sm">
						<SelectValue placeholder="Selecionar turno..." />
					</SelectTrigger>
					<SelectContent>
						{shifts?.map((s) => (
							<SelectItem key={s.id} value={s.id.toString()}>
								{formatShift(s)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={confirmType} onValueChange={setConfirmType}>
					<SelectTrigger className="w-full max-w-sm">
						<SelectValue placeholder="Selecionar tipo..." />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="0">Entrada</SelectItem>
						<SelectItem value="1">Saída</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<DialogFooter className="sm:justify-start">
				<DialogClose asChild>
					<Button type="button">Cancelar</Button>
				</DialogClose>
				<Button
					onClick={submit}
					disabled={!shift || !confirmType || isPending}
					type="button"
				>
					Bater Ponto
				</Button>
			</DialogFooter>
		</>
	);
}
