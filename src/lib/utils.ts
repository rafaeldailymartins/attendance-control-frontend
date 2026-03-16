import { AxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { isValid, parse } from "date-fns";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import type { ErrorType } from "@/http/customInstance";
import type {
	AttendanceType,
	ShiftResponse,
	WeekdayEnum,
} from "@/http/gen/api.schemas";
import { storage } from "./storage";

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

	if (error.status === 401) {
		storage.clear();
		window.location.href = "/login";
		return;
	}

	if (error.status >= 400) {
		toast.warning(message);
		return;
	}
}

export function isJwtExpired(token: string) {
	try {
		const [, payloadBase64] = token.split(".");
		const payloadJson = atob(
			payloadBase64.replace(/-/g, "+").replace(/_/g, "/"),
		);
		const payload = JSON.parse(payloadJson);

		if (!payload.exp) return true;

		const now = Math.floor(Date.now() / 1000);
		return payload.exp < now;
	} catch (err) {
		console.error("Invalid Token:", err);
		return true;
	}
}

export function isLoggedIn() {
	const token = storage.accessToken.get();

	if (!token) return false;

	if (isJwtExpired(token)) {
		storage.clear();
		return false;
	}

	return true;
}

export function formatShift(shift: ShiftResponse) {
	return `${WEEKDAY_MAP[shift.weekday]}: ${shift.startTime} - ${shift.endTime}`;
}

export const WEEKDAY_MAP: Record<WeekdayEnum, string> = {
	0: "Segunda",
	1: "Terça",
	2: "Quarta",
	3: "Quinta",
	4: "Sexta",
	5: "Sábado",
	6: "Domingo",
};

export const ATTENDANCE_TYPE_MAP: Record<AttendanceType, string> = {
	0: "Entrada",
	1: "Saída",
};

const TIME_FORMATS = ["HH:mm:ss", "HH:mm"];

export function parseTime(value: string, baseDate: Date) {
	for (const format of TIME_FORMATS) {
		const parsed = parse(value, format, baseDate);
		if (isValid(parsed)) return parsed;
	}

	return undefined;
}
