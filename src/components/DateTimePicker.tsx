import { format, set } from "date-fns";
import { cn, parseTime } from "@/lib/utils";
import { DatePicker } from "./DatePicker";
import { Input } from "./ui/input";

interface Props {
	placeHolder?: string;
	date?: Date;
	onChange: (value?: Date) => void;
	id?: string;
	isInvalid?: boolean;
}

export function DateTimePicker({
	placeHolder,
	date,
	onChange,
	id,
	isInvalid,
}: Props) {
	function handleChangeDate(value?: Date) {
		if (!value) return;

		if (!date) {
			onChange(value);
			return;
		}

		const newDate = set(value, {
			hours: date.getHours(),
			minutes: date.getMinutes(),
			seconds: date.getSeconds(),
			milliseconds: date.getMilliseconds(),
		});

		onChange(newDate);
	}

	function handleChangeTime(event: React.ChangeEvent<HTMLInputElement>) {
		const value = event.target.value;
		onChange(parseTime(value, date ?? new Date()));
	}

	return (
		<div className="flex w-full max-w-sm gap-2">
			<div className="flex-1">
				<DatePicker
					id={id}
					placeHolder={placeHolder}
					date={date}
					onChange={handleChangeDate}
					isInvalid={isInvalid}
				/>
			</div>
			<div>
				<Input
					type="time"
					id={`time-picker-${id}`}
					step="1"
					value={date ? format(date, "HH:mm:ss") : ""}
					onChange={handleChangeTime}
					aria-invalid={isInvalid}
					className={cn(
						"w-fit hover:text-muted-foreground justify-between border border-input hover:bg-transparent cursor-default text-muted-foreground font-normal",
						date && ["text-accent-foreground hover:text-accent-foreground"],
					)}
				/>
			</div>
		</div>
	);
}
