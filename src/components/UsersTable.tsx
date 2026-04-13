import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type { UserResponse } from "@/http/gen/api.schemas";
import { UsersService } from "@/http/services";
import { DataTable } from "./DataTable";
import { Loading } from "./Loading";
import { SaveUserDialog } from "./SaveUserDialog";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

export const columns: ColumnDef<UserResponse>[] = [
	{
		accessorKey: "name",
		header: "Nome",
	},
	{
		accessorKey: "email",
		header: "E-mail",
	},
	{
		accessorKey: "role.name",
		header: "Cargo",
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return (
				<div className="flex justify-end pr-8">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Abrir menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Ações</DropdownMenuLabel>
							<SaveUserDialog user={row.original} title="Editar Usuário">
								<DropdownMenuItem
									className="cursor-pointer"
									onSelect={(e) => e.preventDefault()}
								>
									Editar
								</DropdownMenuItem>
							</SaveUserDialog>
							<DropdownMenuItem className="cursor-pointer">
								Excluir
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];

export function UsersTable() {
	const [search, setSearch] = useState("");
	const { debouncedValue: debouncedSearch } = useDebounce(search, 300);

	const { data, fetchNextPage, isLoading } = UsersService.useListUsersInfinite(
		{
			pageSize: 10,
			search: debouncedSearch,
		},
		{
			query: {
				getNextPageParam: (page) =>
					page.currentPage + 1 <= page.totalPages ? page.currentPage + 1 : null,
			},
		},
	);

	function handleChangeSearch(event: React.ChangeEvent<HTMLInputElement>) {
		const value = event.target.value;
		setSearch(value);
	}

	return (
		<div className="py-6">
			<div className="flex flex-row gap-5 items-end justify-end">
				<InputGroup className="max-w-sm">
					<InputGroupInput
						value={search}
						onChange={handleChangeSearch}
						placeholder="Procurar..."
					/>
					<InputGroupAddon>
						<SearchIcon />
					</InputGroupAddon>
				</InputGroup>
				<SaveUserDialog title="Criar Usuário">
					<Button className="max-w-sm">
						<Plus />
						CRIAR USUÁRIO
					</Button>
				</SaveUserDialog>
			</div>
			<div className="container mx-auto py-6">
				{isLoading ? (
					<Loading />
				) : (
					<DataTable
						columns={columns}
						infiniteQuery
						nextPageFn={fetchNextPage}
						data={data?.pages ?? []}
					/>
				)}
			</div>
		</div>
	);
}
