import { type ClassValue, clsx } from "clsx";
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
