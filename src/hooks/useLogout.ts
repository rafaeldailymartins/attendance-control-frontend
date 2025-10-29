import { useNavigate } from "@tanstack/react-router";
import { storage } from "@/lib/storage";

export function useLogout() {
	const navigate = useNavigate();

	function logout() {
		storage.clear();
		navigate({ to: "/login" });
	}

	return logout;
}
