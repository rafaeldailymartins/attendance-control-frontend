import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import type { RoleCreate } from "@/http/gen/api.schemas";
import { ConfigService } from "@/http/services";
import { queryClient } from "@/queryClient";
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
	name: z.string().min(1, "Este campo é obrigatório"),
});

export type CreateRoleFormType = z.infer<typeof FormSchema>;

interface Props {
	children?: ReactNode;
}

export function CreateRoleDialog({ children }: Props) {
	const [open, setOpen] = useState(false);

	const { mutateAsync: create, isPending } = ConfigService.useCreateNewRole({
		mutation: {
			onMutate: () => {
				const toastId = toast.loading("Criando Cargo...");
				return { toastId };
			},
			onSuccess: () => {
				toast.success("Cargo criado com sucesso");

				queryClient.invalidateQueries({
					queryKey: ConfigService.getListRolesQueryKey(),
				});
			},
			onSettled: (_data, _error, _variables, res) => {
				toast.dismiss(res?.toastId);
			},
		},
	});

	const form = useForm<CreateRoleFormType>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: "",
		},
	});

	async function onSubmit(formData: CreateRoleFormType) {
		const data: RoleCreate = {
			name: formData.name,
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
							<DialogTitle>Adicionar Cargo</DialogTitle>
							<DialogDescription className="sr-only">
								Formulário para adicionar cargo
							</DialogDescription>
						</DialogHeader>
						<div className="w-full space-y-4 py-3">
							<FormField
								control={form.control}
								name="name"
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
