import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
	placeHolder?: string;
	date?: Date;
	onChange: (value?: Date) => void;
	id?: string;
	isInvalid?: boolean;
}

export function DatePicker({
	placeHolder,
	date,
	onChange,
	id,
	isInvalid,
}: Props) {
	const [open, setOpen] = useState(false);

	function handleSelect(value?: Date) {
		onChange(value);
		if (value) setOpen(false);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					data-empty={!date}
					id={id}
					aria-invalid={isInvalid}
					className={cn(
						"w-full max-w-sm hover:text-muted-foreground justify-between border border-input hover:bg-transparent cursor-default text-muted-foreground font-normal",
						date && ["text-accent-foreground hover:text-accent-foreground"],
					)}
				>
					{date ? (
						date.toLocaleDateString("pt-BR")
					) : (
						<span>{placeHolder ?? "Selecione uma data"}</span>
					)}
					<ChevronDownIcon />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={handleSelect}
					defaultMonth={date}
				/>
			</PopoverContent>
		</Popover>
	);
}
