import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./ui/empty";
import { Spinner } from "./ui/spinner";

export function Loading({ className }: { className?: string }) {
	return (
		<Empty className={className}>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Spinner className="size-10 text-primary" />
				</EmptyMedia>
				<EmptyTitle className="text-primary">Carregando os dados...</EmptyTitle>
				<EmptyDescription>
					Por favor aguarde. Estamos preparando os dados para você.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
