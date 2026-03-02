import type {
	InfiniteData,
	InfiniteQueryObserverResult,
} from "@tanstack/react-query";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";

interface PageResponse<TData> {
	items: TData[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	currentPageSize: number;
}

interface BaseTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
}

interface InfiniteQueryTableProps<TData, TValue>
	extends BaseTableProps<TData, TValue> {
	data: PageResponse<TData>[];
	infiniteQuery: true;
	nextPageFn: () => Promise<
		InfiniteQueryObserverResult<
			InfiniteData<PageResponse<TData>, number | undefined>
		>
	>;
}

interface DefaultTableProps<TData, TValue>
	extends BaseTableProps<TData, TValue> {
	data: TData[];
	infiniteQuery?: false;
	nextPageFn?: undefined;
}

type DataTableProps<TData, TValue> =
	| InfiniteQueryTableProps<TData, TValue>
	| DefaultTableProps<TData, TValue>;

export function DataTable<TData, TValue>({
	columns,
	data,
	infiniteQuery,
	nextPageFn,
}: DataTableProps<TData, TValue>) {
	const lastPage = infiniteQuery ? data.at(-1) : undefined;

	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const table = useReactTable({
		data: infiniteQuery ? data.flatMap((page) => page.items) : data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		autoResetPageIndex: false,
		rowCount: infiniteQuery ? lastPage?.totalItems : undefined,
		onPaginationChange: setPagination,
		state: {
			pagination,
		},
	});

	async function handleNextPage() {
		if (data.length <= pagination.pageIndex + 1) await nextPageFn?.();
		table.nextPage();
	}

	function getCountPageRows() {
		return Math.min(
			(pagination.pageIndex + 1) * pagination.pageSize,
			table.getRowCount(),
		);
	}

	function getInitialCountPageRows() {
		return table.getRowCount()
			? pagination.pageIndex * pagination.pageSize + 1
			: 0;
	}

	return (
		<div>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									Sem resultados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<p className="text-xs">
					{getInitialCountPageRows()}-{getCountPageRows()} de{" "}
					{table.getRowCount()}
				</p>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronLeft />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleNextPage}
					disabled={!table.getCanNextPage()}
				>
					<ChevronRight />
				</Button>
			</div>
		</div>
	);
}
