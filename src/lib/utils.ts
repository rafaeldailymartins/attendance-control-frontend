import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function toPascalCase(str: string) {
	return str
		.replace(/([a-z])([A-Z])/g, "$1 $2") // Splits camelCase words into separate words
		.replace(/[-_]+|[^\p{L}\p{N}]/gu, " ") // Replaces dashes, underscores, and special characters with spaces
		.toLowerCase() // Converts the entire string to lowercase
		.replace(/(?:^|\s)(\p{L})/gu, (_, letter) => letter.toUpperCase()) // Capitalizes the first letter of each word
		.replace(/\s+/g, ""); // Removes all spaces
}
