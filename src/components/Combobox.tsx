import { CommandEmpty } from "cmdk";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface ComboboxItem<T> {
	value: T;
	label: string;
}

export function Combobox<T extends string | number>({
	id,
	name,
	isInvalid,
	emptyMessage,
	value,
	onChange,
	items,
	className,
}: {
	id?: string;
	name?: string;
	isInvalid?: boolean;
	emptyMessage?: string;
	value?: T;
	onChange?: (value?: T) => void;
	items?: ComboboxItem<T>[];
	className?: string;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					role="combobox"
					aria-expanded={open}
					id={id}
					name={name}
					aria-invalid={isInvalid}
					className={cn(
						"w-full hover:text-muted-foreground justify-between border border-input hover:bg-transparent cursor-default text-muted-foreground font-normal",
						className,
						value && ["text-accent-foreground hover:text-accent-foreground"],
					)}
				>
					{items?.find((i) => i.value === value)?.label ??
						"Selecionar usuário..."}
					<ChevronDown className="opacity-50 text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0">
				<Command className="max-h-48">
					<CommandInput />
					<CommandList>
						<CommandEmpty>{emptyMessage ?? "Sem dados."}</CommandEmpty>
						<CommandGroup>
							{items?.map((item) => (
								<CommandItem
									key={item.value}
									value={item.label}
									onSelect={() => {
										onChange?.(item.value);
										setOpen(false);
									}}
								>
									{item.label}
									<Check
										className={cn(
											"ml-auto",
											value === item.value ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
