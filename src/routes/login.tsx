import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BodyLoginUsersLoginPost as LoginRequest } from "@/http/gen/api.schemas";
import { UsersService } from "@/http/services";
import { storage } from "@/lib/storage";

export const Route = createFileRoute("/login")({
	component: Login,
});

const FormSchema = z.object({
	email: z.email({ error: "Endereço de e-mail inválido" }),
	password: z.string().min(1, { message: "A senha é obrigatória" }),
});

type FormType = z.infer<typeof FormSchema>;

function Login() {
	const { mutateAsync: login, isPending } = UsersService.useLogin({
		mutation: {
			onMutate: () => {
				const toastId = toast.loading("Entrando...");
				return { toastId };
			},
			onSuccess: (data) => {
				storage.accessToken.set(data.accessToken);
			},
			onSettled: (_data, _error, _variables, res) => {
				// Dismiss the toast after 1 second
				setTimeout(() => {
					toast.dismiss(res?.toastId);
				}, 1000);
			},
		},
	});

	async function onSubmit(formData: FormType) {
		const data: LoginRequest = {
			username: formData.email,
			password: formData.password,
		};
		await login({ data });
	}

	const form = useForm<FormType>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	return (
		<div className="flex flex-row">
			<div className="flex items-center justify-center p-6 bg-[url('/loginBackground.png')] bg-cover bg-center min-h-screen w-3/5">
				<h1 className="text-white font-semibold text-6xl">
					SISTEMA DE CONTROLE DE PRESENÇA
				</h1>
			</div>
			<div className="flex items-center justify-center min-h-screen p-6 bg-gray-50 w-2/5">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-3xl">Login</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-3">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="w-full space-y-6"
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input placeholder="email@email.com" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Senha</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="***********"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button disabled={isPending} className="w-full" type="submit">
									Entrar
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
