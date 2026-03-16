import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { format, parseISO } from "date-fns";
import { TriangleAlert } from "lucide-react";
import { type ReactNode, Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	type AttendanceResponse,
	AttendanceType,
	type AttendanceUpdate,
	WeekdayEnum,
} from "@/http/gen/api.schemas";
import { RecordsService, UsersService } from "@/http/services";
import { ATTENDANCE_TYPE_MAP, WEEKDAY_MAP } from "@/lib/utils";
import { queryClient } from "@/queryClient";
import { ComboboxUser } from "./ComboboxUser";
import { DateTimePicker } from "./DateTimePicker";
import { Loading } from "./Loading";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Props {
	children?: ReactNode;
	title?: string;
	attendance: AttendanceResponse;
}

export function UpdateAttendanceDialog({ children, title, attendance }: Props) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription className="sr-only">
						Formulário para atualização de frequência.
					</DialogDescription>
					<Tabs defaultValue="info" className="w-[400px]">
						<TabsList variant="line">
							<TabsTrigger value="info">Informações</TabsTrigger>
						</TabsList>
						<TabsContent value="info">
							<Suspense fallback={<Loading />}>
								<AttendanceForm attendance={attendance} />
							</Suspense>
						</TabsContent>
					</Tabs>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

const UserResponseSchema = z.object({
	id: z.number(),
	email: z.email(),
	name: z.string(),
	shifts: z.array(
		z.object({
			id: z.number(),
			weekday: z.enum(WeekdayEnum),
			startTime: z.string(),
			endTime: z.string(),
		}),
	),
	active: z.boolean(),
});

const FormSchema = z.object({
	user: UserResponseSchema.optional()
		.refine((usr) => usr, "Selecione um usuário")
		.refine(
			(usr) => usr?.shifts.length,
			"O usuário deve ter ao menos um turno cadastrado",
		),
	shiftId: z
		.number("Selecione um turno válido")
		.int()
		.positive("Selecione um turno válido"),
	attendanceType: z.enum(AttendanceType, "Selecione um tipo de ponto válido"),
	timestamp: z.date("Selecione uma data válida"),
	minutesLate: z
		.number("Insira um valor para os minutos de atraso")
		.int()
		.min(0),
});

type FormType = z.infer<typeof FormSchema>;

function AttendanceForm({ attendance }: { attendance: AttendanceResponse }) {
	const { data: user } = UsersService.useGetUserSuspense(
		attendance.shift.user.id,
	);
	const { mutateAsync: updateAttendance, isPending } =
		RecordsService.useUpdateAttendance({
			mutation: {
				onMutate: () => {
					const toastId = toast.loading("Atualizando...");
					return { toastId };
				},
				onSuccess: () => {
					toast.success("Presença atualizada com sucesso");

					queryClient.invalidateQueries({
						queryKey: RecordsService.getListAttendancesInfiniteQueryKey(),
					});
				},
				onSettled: (_data, _error, _variables, res) => {
					toast.dismiss(res?.toastId);
				},
			},
		});

	const form = useForm<FormType>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			user: user,
			shiftId: attendance.shift.id,
			attendanceType: attendance.attendanceType,
			timestamp: parseISO(attendance.timestamp),
			minutesLate: attendance.minutesLate,
		},
	});

	const selectedUser = form.watch("user");

	async function onSubmit(formData: FormType) {
		const data: AttendanceUpdate = {
			attendanceType: formData.attendanceType,
			shiftId: formData.shiftId,
			timestamp: format(formData.timestamp, "yyyy-MM-dd'T'HH:mm:ss"),
			minutesLate: formData.minutesLate,
		};
		await updateAttendance({ attendanceId: attendance.id, data });
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="w-full space-y-4 py-3"
			>
				<FormField
					control={form.control}
					name="user"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Usuário</FormLabel>
							<FormControl>
								<ComboboxUser
									user={field.value}
									onChange={(val) => {
										field.onChange(val);
										form.setValue("shiftId", -1);
									}}
									isInvalid={fieldState.invalid}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="shiftId"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Turno</FormLabel>
							<FormControl>
								<Select
									name={field.name}
									value={field.value !== -1 ? field.value.toString() : ""}
									onValueChange={(val) => field.onChange(parseInt(val, 10))}
								>
									<SelectTrigger
										aria-invalid={fieldState.invalid}
										className="max-w-sm w-full"
									>
										<SelectValue
											placeholder={
												selectedUser
													? "Selecione o turno..."
													: "Selecione um usuário primeiro"
											}
										/>
									</SelectTrigger>
									<SelectContent position="item-aligned">
										{selectedUser?.shifts.map((shift) => (
											<SelectItem key={shift.id} value={shift.id.toString()}>
												{WEEKDAY_MAP[shift.weekday]} -{" "}
												{shift.startTime.slice(0, 5)} às{" "}
												{shift.endTime.slice(0, 5)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							{selectedUser && selectedUser.shifts.length === 0 ? (
								<div className="flex flex-row gap-2 items-center mt-1">
									<TriangleAlert className="text-warning" size={18} />
									<p className="text-[0.8rem] font-medium text-warning">
										Atenção: Este usuário não possui turnos cadastrados.
									</p>
								</div>
							) : (
								<FormMessage />
							)}
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="attendanceType"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Tipo</FormLabel>
							<FormControl>
								<Select
									name={field.name}
									value={
										field.value !== undefined ? field.value.toString() : ""
									}
									onValueChange={(val) => field.onChange(parseInt(val, 10))}
								>
									<SelectTrigger
										aria-invalid={fieldState.invalid}
										className="max-w-sm w-full"
									>
										<SelectValue placeholder="Selecione o tipo de ponto..." />
									</SelectTrigger>
									<SelectContent position="item-aligned">
										{Object.entries(ATTENDANCE_TYPE_MAP).map((type) => (
											<SelectItem key={type[0]} value={type[0]}>
												{type[1]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="timestamp"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Data/Hora da Presença</FormLabel>
							<FormControl>
								<DateTimePicker
									date={field.value}
									onChange={field.onChange}
									isInvalid={fieldState.invalid}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="minutesLate"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Minutos de Atraso</FormLabel>
							<FormControl>
								<Input
									type="number"
									min="0"
									step="1"
									className="max-w-sm"
									value={field.value}
									onChange={(event) => {
										const value = event.target.value;
										field.onChange(value === "" ? undefined : Number(value));
									}}
									aria-invalid={fieldState.invalid}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<DialogClose asChild>
					<Button disabled={isPending} className="w-full" type="submit">
						Atualizar
					</Button>
				</DialogClose>
			</form>
		</Form>
	);
}
