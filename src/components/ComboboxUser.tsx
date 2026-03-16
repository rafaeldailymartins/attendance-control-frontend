import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/hooks/useDebounce";
import type { UserResponse } from "@/http/gen/api.schemas";
import { UsersService } from "@/http/services";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function ComboboxUser({
	user,
	onChange,
	id,
	name,
	isInvalid,
}: {
	user?: UserResponse;
	onChange: (value?: UserResponse) => void;
	id?: string;
	name?: string;
	isInvalid?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const { debouncedValue: debouncedSearch, isDebouncing } = useDebounce(
		search,
		300,
	);
	const { data, fetchNextPage, isFetchingNextPage, isLoading } =
		UsersService.useListUsersInfinite(
			{ pageSize: 20, search: debouncedSearch },
			{
				query: {
					getNextPageParam: (page) =>
						page.currentPage + 1 <= page.totalPages
							? page.currentPage + 1
							: null,
				},
			},
		);
	const { ref } = useInView({
		onChange: (inView) => {
			if (inView && !isDebouncing && !isFetchingNextPage) {
				fetchNextPage();
			}
		},
	});
	const items = data?.pages.flatMap((page) => page.items) ?? [];

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
						"w-full max-w-sm hover:text-muted-foreground justify-between border border-input hover:bg-transparent cursor-default text-muted-foreground font-normal",
						user && ["text-accent-foreground hover:text-accent-foreground"],
					)}
				>
					{user ? user.name : "Selecionar usuário..."}
					<ChevronDown className="opacity-50 text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0">
				<Command className="max-h-48">
					<CommandInput value={search} onValueChange={setSearch} />
					<CommandList>
						<CommandEmpty>
							{isLoading ? "Carregando..." : "Usuário não encontrado"}
						</CommandEmpty>
						<CommandGroup>
							{items.map((item) => (
								<CommandItem
									key={item.id}
									value={item.name}
									onSelect={() => {
										onChange(user?.id === item.id ? undefined : item);
										setOpen(false);
									}}
								>
									{item.name}
									<Check
										className={cn(
											"ml-auto",
											user?.id === item.id ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
						<div className="min-h-1" ref={ref}>
							{isFetchingNextPage && "Carregando..."}
						</div>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
