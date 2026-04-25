import { type ReactNode, useState } from "react";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

interface Props {
	children?: ReactNode;
	onConfirm?: () => void | Promise<void>;
}

export function ConfirmDialog({ children, onConfirm }: Props) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	async function handleConfirm() {
		try {
			setLoading(true);
			if (onConfirm) await onConfirm();
			setOpen(false);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Deseja prosseguir?</DialogTitle>
					<DialogDescription>
						Esta ação não poderá ser desfeita.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={loading}>
							Cancelar
						</Button>
					</DialogClose>
					<Button onClick={handleConfirm} disabled={loading}>
						Confirmar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
