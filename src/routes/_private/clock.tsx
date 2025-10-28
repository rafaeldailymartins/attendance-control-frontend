import { createFileRoute } from "@tanstack/react-router";
import { UsersService } from "@/http/services";

export const Route = createFileRoute("/_private/clock")({
	component: Clock,
});

function Clock() {
	const { data } = UsersService.useGetCurrentUser();

	return (
		<div>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
}
