import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import type { DayOffCreate } from "@/http/gen/api.schemas";
import { ConfigService } from "@/http/services";
import { queryClient } from "@/queryClient";
import { DatePicker } from "./DatePicker";
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

const FormSchema = z.object({
	day: z.date("Selecione uma data válida"),
	description: z.string().optional(),
});

export type CreateDayOffFormType = z.infer<typeof FormSchema>;

interface Props {
	children?: ReactNode;
}

export function CreateDayOffDialog({ children }: Props) {
	const [open, setOpen] = useState(false);

	const { mutateAsync: create, isPending } = ConfigService.useCreateNewDayOff({
		mutation: {
			onMutate: () => {
				const toastId = toast.loading("Criando Dia Livre...");
				return { toastId };
			},
			onSuccess: () => {
				toast.success("Dia Livre criado com sucesso");

				queryClient.invalidateQueries({
					queryKey: ConfigService.getListDaysOffInfiniteQueryKey(),
				});
			},
			onSettled: (_data, _error, _variables, res) => {
				toast.dismiss(res?.toastId);
			},
		},
	});

	const form = useForm<CreateDayOffFormType>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			description: "",
		},
	});

	async function onSubmit(formData: CreateDayOffFormType) {
		const data: DayOffCreate = {
			day: format(formData.day, "yyyy-MM-dd"),
			description: formData.description ?? "",
		};
		await create({ data });

		setOpen(false);
		form.reset();
	}

	function handleOpenChange(value: boolean) {
		if (!value) form.reset();

		setOpen(value);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Adicionar Dia Livre</DialogTitle>
							<DialogDescription className="sr-only">
								Formulário para adicionar dia livre
							</DialogDescription>
						</DialogHeader>
						<div className="w-full space-y-4 py-3">
							<FormField
								control={form.control}
								name="day"
								render={({ field, fieldState }) => (
									<FormItem>
										<FormLabel>Data</FormLabel>
										<FormControl>
											<DatePicker
												placeHolder="DD/MM/YYYY"
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
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Descrição</FormLabel>
										<FormControl>
											<Input
												className="max-w-sm"
												placeholder="Digite uma descrição..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" disabled={isPending}>
									Cancelar
								</Button>
							</DialogClose>
							<Button disabled={isPending}>Confirmar</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
