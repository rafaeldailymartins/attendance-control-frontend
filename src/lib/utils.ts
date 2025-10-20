import { AxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import type { ErrorType } from "@/http/customInstance";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type Result<T, E = ErrorType> = {
	data: T | null;
	error: E | null;
};

export async function tryCatch<T, E = ErrorType>(
	promise: Promise<T>,
): Promise<Result<T, E>> {
	try {
		const data = await promise;
		return {
			data: data,
			error: null,
		};
	} catch (error) {
		return {
			data: null,
			error: error as E,
		};
	}
}

export function handleApiError(error: Error) {
	const DEFAULT_MESSAGE =
		"Ocorreu um erro no servidor. Tente novamente mais tarde.";

	if (!(error instanceof AxiosError)) {
		toast.error("Ocorreu um erro no sistema. tente novamente mais tarde.");
		return;
	}

	const message = error.response?.data?.detail?.message;

	if (error.code === "ERR_NETWORK") {
		toast.error(
			"No momento nossos servidores estão passando por instabilidade. Tente novamente mais tarde.",
			{
				duration: 8000,
			},
		);
		return;
	}

	if (!error.status || !message) {
		toast.error(DEFAULT_MESSAGE);
		return;
	}

	if (error.status >= 500) {
		toast.error(message);
		return;
	}

	if (error.status >= 400) {
		toast.warning(message);
		return;
	}
}
