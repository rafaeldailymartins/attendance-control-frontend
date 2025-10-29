import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/clock")({
	component: Clock,
});

function Clock() {
	return <div></div>;
}
