import { OctagonXIcon } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";
import { Button } from "./ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./ui/empty";

interface Props extends FallbackProps {
	className?: string;
}

export function ErrorFallback({ error, resetErrorBoundary, className }: Props) {
	return (
		<Empty className={className}>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<OctagonXIcon className="size-10 text-error" />
				</EmptyMedia>
				<EmptyTitle className="text-primary">
					{error?.response?.data?.detail?.message ??
						"Desculpe, ocorreu um erro no sistema"}
				</EmptyTitle>
				<EmptyDescription>
					Se o error persisistir, tente novamente mais tarde ou entre em contato
					com o suporte.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={resetErrorBoundary}>Tentar novamente</Button>
			</EmptyContent>
		</Empty>
	);
}
