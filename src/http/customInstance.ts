import Axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import type { ApiError } from "./gen/api.schemas";

export const AXIOS_INSTANCE = Axios.create({
	baseURL: "http://localhost:8000",
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
