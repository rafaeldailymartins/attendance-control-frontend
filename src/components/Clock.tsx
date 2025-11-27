import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Clock({ className, ...props }: React.ComponentProps<"div">) {
	const [time, setTime] = useState(new Date());

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const formattedTime = time.toLocaleTimeString("pt-BR", { hour12: false });

	return (
		<div className={cn("text-2xl", className)} {...props}>
			{formattedTime}
		</div>
	);
}
