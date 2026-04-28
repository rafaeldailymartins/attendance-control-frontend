import { Link, type LinkProps } from "@tanstack/react-router";
import {
	Bolt,
	ChevronRight,
	ChevronsUpDown,
	CircleUserRound,
	Clock,
	FileChartColumn,
	Fingerprint,
	LogOut,
	type LucideIcon,
	UserRoundCog,
	Users,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	useSidebar,
} from "@/components/ui/sidebar";
import { useLogout } from "@/hooks/useLogout";
import { UsersService } from "@/http/services";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

type MenuItem = {
	title: string;
	url?: LinkProps["to"];
	icon: LucideIcon;
	onlyAdmin?: boolean;
	items?: Omit<MenuItem, "items">[];
};

const items: MenuItem[] = [
	{
		title: "Ponto",
		url: "/clock",
		icon: Fingerprint,
	},
	{
		title: "Relatório de Faltas",
		url: "/absences",
		icon: FileChartColumn,
	},
	{
		title: "Registro de Presenças",
		url: "/attendances",
		icon: Clock,
	},
	{
		title: "Admin",
		icon: UserRoundCog,
		onlyAdmin: true,
		items: [
			{
				title: "Usuários Cadastrados",
				url: "/users",
				icon: Users,
			},
			{
				title: "Configurações",
				url: "/config",
				icon: Bolt,
			},
		],
	},
];

export function AppSidebar() {
	return (
		<Sidebar>
			<Content />
			<Footer />
		</Sidebar>
	);
}

function Content() {
	return (
		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupLabel>Sistema de Controle de Presença</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{items.map((item) => (
							<ContentItem key={item.title} item={item} />
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
	);
}

function ContentItem({ item }: { item: MenuItem }) {
	const { data: user, isLoading } = UsersService.useGetCurrentUser();

	if (isLoading)
		return (
			<SidebarMenuItem>
				<Skeleton className="h-12 w-full rounded-md bg-[#084696]" />
			</SidebarMenuItem>
		);

	if (item.onlyAdmin && !user?.role?.isAdmin) return;

	if (item.items)
		return (
			<Collapsible asChild defaultOpen className="group/collapsible">
				<SidebarMenuItem>
					<CollapsibleTrigger asChild>
						<SidebarMenuButton asChild>
							<div className="cursor-pointer">
								<item.icon />
								<span>{item.title}</span>
								<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
							</div>
						</SidebarMenuButton>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub>
							{item.items.map((subItem) => (
								<SidebarMenuItem key={subItem.title}>
									<SidebarMenuButton asChild>
										<Link to={subItem.url}>
											<subItem.icon />
											<span>{subItem.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		);

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild>
				<Link to={item.url}>
					<item.icon />
					<span>{item.title}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

function Footer() {
	const { isMobile } = useSidebar();
	const { data: user, isLoading } = UsersService.useGetCurrentUser();
	const logout = useLogout();

	if (isLoading)
		return (
			<SidebarFooter>
				<Skeleton className="h-12 w-full rounded-md bg-[#084696]" />
			</SidebarFooter>
		);

	if (!user) return;

	return (
		<SidebarFooter>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton size="lg" className="cursor-pointer">
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
								<ChevronsUpDown />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<CircleUserRound />
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">{user.name}</span>
										<span className="text-muted-foreground truncate text-xs">
											{user.email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="cursor-pointer" onClick={logout}>
								<LogOut />
								<span>Sair</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>
	);
}
