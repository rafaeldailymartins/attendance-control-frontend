import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, Suspense, useState } from "react";
import { type FieldErrors, type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
	type UserCreate,
	type UserResponse,
	type UserShiftCreate,
	type UserShiftResponse,
	type UserUpdate,
	WeekdayEnum,
} from "@/http/gen/api.schemas";
import { ConfigService, UsersService } from "@/http/services";
import { queryClient } from "@/queryClient";
import { Combobox } from "./Combobox";
import { Loading } from "./Loading";
import { ShiftSelector } from "./ShiftSelector";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const ShiftSchema = z
	.object({
		id: z.string(),
		startTime: z.iso.time("Selecione uma hora válida"),
		endTime: z.iso.time("Selecione uma hora válida"),
		weekday: z.enum(WeekdayEnum, "Selecione um dia da semana válido"),
	})
	.refine((data) => data.startTime < data.endTime, {
		message: "A hora inicial do turno não pode ser maior que a hora final",
		path: ["startTime"],
	});

const FormSchema = z
	.object({
		edit: z.boolean(),
		name: z
			.string()
			.min(1, "O nome é obrigatório")
			.max(255, "O nome deve conter menos de 255 caracteres"),
		email: z
			.email("Endereço de e-mail inválido")
			.max(255, "O e-mail deve conter menos de 255 caracteres"),
		password: z
			.string()
			.max(50, "A senha deve conter no máximo 50 caracteres")
			.optional(),
		confirmPassword: z.string().optional().or(z.literal("")),
		shifts: z.object({
			0: z.array(ShiftSchema),
			1: z.array(ShiftSchema),
			2: z.array(ShiftSchema),
			3: z.array(ShiftSchema),
			4: z.array(ShiftSchema),
			5: z.array(ShiftSchema),
			6: z.array(ShiftSchema),
		}),
		roleId: z
			.number("Selecione um cargo válido")
			.int()
			.positive("Selecione um cargo válido"),
	})
	.superRefine(({ edit, password, confirmPassword }, ctx) => {
		const isPasswordEmpty = !password || password.length === 0;
		const isPasswordTooShort = password && password.length < 8;
		const passwordsDontMatch = password !== confirmPassword;

		if (!edit && isPasswordEmpty) {
			ctx.addIssue({
				code: "custom",
				message: "A senha é obrigatória",
				path: ["password"],
			});
		}

		if (isPasswordTooShort) {
			ctx.addIssue({
				code: "custom",
				message: "A senha deve conter pelo menos 8 caracteres",
				path: ["password"],
			});
		}

		if ((password || confirmPassword) && passwordsDontMatch) {
			ctx.addIssue({
				code: "custom",
				message: "As senhas não coincidem",
				path: ["confirmPassword"],
			});
		}
	});

export type SaveUserFormType = z.infer<typeof FormSchema>;
type FormReturn = UseFormReturn<SaveUserFormType>;

function mapUserShifts(shifts?: UserShiftResponse[]) {
	const groupedShifts: SaveUserFormType["shifts"] = {
		0: [],
		1: [],
		2: [],
		3: [],
		4: [],
		5: [],
		6: [],
	};

	if (!shifts) return groupedShifts;

	shifts.forEach((shift) => {
		const day = shift.weekday;

		if (day in groupedShifts) {
			groupedShifts[day as keyof typeof groupedShifts].push({
				id: String(shift.id),
				startTime: shift.startTime,
				endTime: shift.endTime,
				weekday: shift.weekday,
			});
		}
	});

	return groupedShifts;
}

interface Props {
	children?: ReactNode;
	title?: string;
	description?: string;
	user?: UserResponse;
}

export function SaveUserDialog({ children, title, description, user }: Props) {
	const [activeTab, setActiveTab] = useState("info");
	const [open, setOpen] = useState(false);

	const { mutateAsync: createUser, isPending: isPendingCreate } =
		UsersService.useCreateNewUser({
			mutation: {
				onMutate: () => {
					const toastId = toast.loading("Criando usuário...");
					return { toastId };
				},
				onSuccess: () => {
					toast.success("Usuário criado com sucesso");

					queryClient.invalidateQueries({
						queryKey: UsersService.getListUsersInfiniteQueryKey(),
					});
				},
				onSettled: (_data, _error, _variables, res) => {
					toast.dismiss(res?.toastId);
				},
			},
		});

	const { mutateAsync: updateUser, isPending: isPendingUpdate } =
		UsersService.useUpdateUser({
			mutation: {
				onMutate: () => {
					const toastId = toast.loading("Atualizando usuário...");
					return { toastId };
				},
				onSuccess: () => {
					toast.success("Usuário atualizado com sucesso");

					queryClient.invalidateQueries({
						queryKey: UsersService.getListUsersInfiniteQueryKey(),
					});
				},
				onSettled: (_data, _error, _variables, res) => {
					toast.dismiss(res?.toastId);
				},
			},
		});

	const form = useForm<SaveUserFormType>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			edit: !!user,
			name: user?.name ?? "",
			email: user?.email ?? "",
			roleId: user?.roleId ?? 0,
			password: "",
			confirmPassword: "",
			shifts: mapUserShifts(user?.shifts),
		},
	});

	function getTabWithError(errors: FieldErrors<SaveUserFormType>) {
		if (errors.name || errors.email || errors.roleId) return "info";
		if (errors.password || errors.confirmPassword) return "password";
		if (errors.shifts) return "shifts";
		return null;
	}

	function onError(errors: FieldErrors<SaveUserFormType>) {
		const tabWithError = getTabWithError(errors);
		if (tabWithError) {
			setActiveTab(tabWithError);
		}
	}

	async function onSubmit(formData: SaveUserFormType) {
		setOpen(false);
		if (formData.edit) {
			await update(formData);
			return;
		}
		await create(formData);
		form.reset();
		setActiveTab("info");
	}

	async function update(formData: SaveUserFormType) {
		if (!user?.id) {
			toast.error("Não foi possível atualizar usuário");
			return;
		}

		const shifts: UserShiftCreate[] = Object.values(formData.shifts).flatMap(
			(shiftsArray) =>
				shiftsArray.map((shift) => ({
					startTime: shift.startTime,
					endTime: shift.endTime,
					weekday: shift.weekday,
				})),
		);

		const data: UserUpdate = {
			name: formData.name,
			email: formData.email,
			roleId: formData.roleId,
			password: formData.password !== "" ? formData.password : undefined,
			shifts: shifts,
		};

		await updateUser({ userId: user.id, data });
	}

	async function create(formData: SaveUserFormType) {
		const shifts: UserShiftCreate[] = Object.values(formData.shifts).flatMap(
			(shiftsArray) =>
				shiftsArray.map((shift) => ({
					startTime: shift.startTime,
					endTime: shift.endTime,
					weekday: shift.weekday,
				})),
		);

		const data: UserCreate = {
			name: formData.name,
			email: formData.email,
			roleId: formData.roleId,
			password: formData.password ?? "",
			shifts: shifts,
		};

		await createUser({ data });
	}

	function handleOpenChange(value: boolean) {
		if (!value) {
			form.reset();
			setActiveTab("info");
		}

		setOpen(value);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-lg" key={user?.id ?? "new-user"}>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit, onError)}>
						<DialogHeader>
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription className="sr-only">
								{description ?? "Formulário de cadastro do usuário"}
							</DialogDescription>
						</DialogHeader>
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList variant="line">
								<TabsTrigger value="info">Informações</TabsTrigger>
								<TabsTrigger value="password">
									{user ? "Redefinir Senha" : "Senha"}
								</TabsTrigger>
								<TabsTrigger value="shifts">Turnos</TabsTrigger>
							</TabsList>
							<Suspense fallback={<Loading />}>
								<TabsContent value="info">
									<BasicInfoForm form={form} />
								</TabsContent>
								<TabsContent value="password">
									<PasswordForm form={form} />
								</TabsContent>
								<TabsContent value="shifts">
									<ShiftsForm form={form} />
								</TabsContent>
							</Suspense>
						</Tabs>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">Cancelar</Button>
							</DialogClose>
							<Button
								disabled={isPendingCreate || isPendingUpdate}
								type="submit"
							>
								Salvar
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function BasicInfoForm({ form }: { form: FormReturn }) {
	const { data } = ConfigService.useListRolesSuspense();

	return (
		<div className="w-full space-y-4 py-3">
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Nome</FormLabel>
						<FormControl>
							<Input
								className="max-w-sm"
								placeholder="Digite o nome do usuário"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="email"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Email</FormLabel>
						<FormControl>
							<Input
								className="max-w-sm"
								placeholder="email@email.com"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="roleId"
				render={({ field, fieldState }) => (
					<FormItem>
						<FormLabel>Cargo</FormLabel>
						<FormControl>
							<Combobox
								className="max-w-sm"
								value={field.value}
								onChange={field.onChange}
								isInvalid={fieldState.invalid}
								items={data.map((role) => ({
									value: role.id,
									label: role.name,
								}))}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}

function PasswordForm({ form }: { form: FormReturn }) {
	return (
		<div className="w-full space-y-4 py-3">
			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Senha</FormLabel>
						<FormControl>
							<Input
								className="max-w-sm"
								type="password"
								placeholder="***********"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="confirmPassword"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Confirmar Senha</FormLabel>
						<FormControl>
							<Input
								className="max-w-sm"
								type="password"
								placeholder="***********"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}

function ShiftsForm({ form }: { form: FormReturn }) {
	return (
		<div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
			<FormField
				control={form.control}
				name="shifts"
				render={({ field }) => (
					<FormItem>
						<FormControl>
							<ShiftSelector {...field} errors={form.formState.errors} />
						</FormControl>
					</FormItem>
				)}
			/>
		</div>
	);
}
