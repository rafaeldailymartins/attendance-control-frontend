import Axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { storage } from "@/lib/storage";
import type { ApiError } from "./gen/api.schemas";

export const AXIOS_INSTANCE = Axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
	const token = storage.accessToken.get();

	if (token) {
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

export const customInstance = <T>(
	config: AxiosRequestConfig,
	options?: AxiosRequestConfig,
): Promise<T> => {
	const promise = AXIOS_INSTANCE({ ...config, ...options })
		.then(({ data }) => data)
		.catch((err: AxiosError) => {
			throw err;
		});

	return promise;
};

export type BodyType<BodyData> = BodyData;
export type ErrorType<Error = ApiError> = AxiosError<Error>;
