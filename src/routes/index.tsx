import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return <div className="text-center">SISTEMA DE CONTROLE DE PRESENÇA</div>;
}
