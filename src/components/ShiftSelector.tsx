import { CirclePlus, CircleX, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { type UserShiftCreate, WeekdayEnum } from "@/http/gen/api.schemas";
import { cn, WEEKDAY_MAP } from "@/lib/utils";
import type { SaveUserFormType } from "./SaveUserDialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface Weekday {
	day: WeekdayEnum;
	name: string;
}

type ShiftCreateWithId = UserShiftCreate & {
	id: string;
};
type Shifts = Record<WeekdayEnum, ShiftCreateWithId[]>;

interface Props {
	value: Shifts;
	onChange: (value: Shifts) => void;
	errors?: FieldErrors<SaveUserFormType>;
}

export function ShiftSelector({ value, onChange, errors }: Props) {
	const shifts = value;

	const weekdays = Object.entries(WEEKDAY_MAP).map<Weekday>(([key, value]) => ({
		day: Number(key) as WeekdayEnum,
		name: value,
	}));

	function addShift(weekday: WeekdayEnum) {
		onChange({
			...shifts,
			[weekday]: [
				...shifts[weekday],
				{
					id: crypto.randomUUID(),
					weekday,
					startTime: "",
					endTime: "",
				},
			],
		});
	}

	function updateShift(
		weekday: WeekdayEnum,
		id: string,
		data: Partial<UserShiftCreate>,
	) {
		onChange({
			...shifts,
			[weekday]: shifts[weekday].map((shift) =>
				shift.id === id ? { ...shift, ...data } : shift,
			),
		});
	}

	function removeShift(weekday: WeekdayEnum, id: string) {
		onChange({
			...shifts,
			[weekday]: shifts[weekday].filter((shift) => shift.id !== id),
		});
	}

	function copyShiftsWithLimit(fromWeekday: WeekdayEnum) {
		const sourceShifts = shifts[fromWeekday];

		if (!sourceShifts?.length) return;

		const next = { ...shifts };

		Object.values(WeekdayEnum).forEach((day) => {
			if (day === fromWeekday) return;

			const currentShifts = next[day] ?? [];
			const availableSlots = 4 - currentShifts.length;

			if (availableSlots <= 0) return;

			const shiftsToCopy = sourceShifts.slice(0, availableSlots);

			const newShifts = shiftsToCopy.map((shift) => ({
				...shift,
				id: crypto.randomUUID(),
				weekday: day,
			}));

			next[day] = [...currentShifts, ...newShifts];
		});

		onChange(next);
	}
	return (
		<div className="flex flex-col gap-3 py-3">
			{weekdays.map((weekday) => (
				<div
					key={weekday.day}
					className="flex rounded-md w-[450px] bg-[#e2e6ec] justify-between"
				>
					<span
						className={cn(
							"text-sm p-2",
							errors?.shifts?.[weekday.day]?.length
								? "text-red-500 font-semibold"
								: "opacity-60",
						)}
					>
						{weekday.name}
					</span>

					<WeekdayShiftSelector
						shifts={shifts}
						weekday={weekday.day}
						onAdd={addShift}
						onUpdate={updateShift}
						onRemove={removeShift}
						onCopy={copyShiftsWithLimit}
						errors={errors}
					/>
				</div>
			))}
		</div>
	);
}

function WeekdayShiftSelector({
	shifts,
	weekday,
	onAdd,
	onUpdate,
	onRemove,
	onCopy,
	errors,
}: {
	shifts: Shifts;
	weekday: WeekdayEnum;
	onAdd: (weekday: WeekdayEnum) => void;
	onUpdate: (
		weekday: WeekdayEnum,
		id: string,
		data: Partial<UserShiftCreate>,
	) => void;
	onRemove: (weekday: WeekdayEnum, id: string) => void;
	onCopy: (weekday: WeekdayEnum) => void;
	errors?: FieldErrors<SaveUserFormType>;
}) {
	if (!shifts[weekday]?.length) {
		return (
			<div className="flex">
				<p className="text-sm p-2">Nenhum turno aplicado</p>
				<div className="flex p-1 bg-[#d2dded] rounded-r-md items-center">
					<Button
						variant="ghost"
						onClick={() => onAdd(weekday)}
						className="size-6 hover:bg-transparent"
					>
						<CirclePlus className="opacity-60" size={18} />
					</Button>

					<Button
						variant="ghost"
						disabled
						className="size-6 hover:bg-transparent"
					>
						<CircleX className="opacity-60" size={18} />
					</Button>

					<Button
						variant="ghost"
						disabled
						className="size-6 hover:bg-transparent"
					>
						<Copy className="opacity-60" size={18} />
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			{shifts[weekday]?.map((shift, idx) => (
				<div key={shift.id} className="flex">
					<div className="flex items-center gap-2 p-1">
						<TimePicker
							value={shift.startTime}
							error={errors?.shifts?.[weekday]?.[idx]?.startTime?.message}
							onChange={(e) =>
								onUpdate(weekday, shift.id, { startTime: e.target.value })
							}
						/>

						<p>às</p>

						<TimePicker
							value={shift.endTime}
							error={errors?.shifts?.[weekday]?.[idx]?.endTime?.message}
							onChange={(e) =>
								onUpdate(weekday, shift.id, { endTime: e.target.value })
							}
						/>
					</div>

					<div className="flex p-1 bg-[#d2dded] rounded-r-md items-center">
						<Button
							variant="ghost"
							type="button"
							disabled={shifts[weekday]?.length >= 4}
							onClick={() => onAdd(weekday)}
							className="size-6 hover:bg-transparent"
						>
							<CirclePlus className="opacity-60" size={18} />
						</Button>

						<Button
							variant="ghost"
							type="button"
							onClick={() => onRemove(weekday, shift.id)}
							className="size-6 hover:bg-transparent"
						>
							<CircleX className="opacity-60" size={18} />
						</Button>

						<Button
							variant="ghost"
							type="button"
							onClick={() => onCopy(weekday)}
							disabled={shifts[weekday]?.length === 0}
							className="size-6 hover:bg-transparent"
						>
							<Copy className="opacity-60" size={18} />
						</Button>
					</div>
				</div>
			))}
		</div>
	);
}

function TimePicker({
	error,
	value,
	onChange,
}: {
	error?: string;
	value?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	const [tooltipOpen, setTooltipOpen] = useState(!!error);

	function handleOpenTooltip(value: boolean) {
		if (error && value) {
			setTooltipOpen(value);
			return;
		}

		setTooltipOpen(false);
	}

	useEffect(() => {
		if (!error) setTooltipOpen(false);
	}, [error]);

	return (
		<Tooltip open={tooltipOpen}>
			<TooltipTrigger asChild>
				<Input
					onMouseEnter={() => handleOpenTooltip(true)}
					onMouseLeave={() => handleOpenTooltip(false)}
					className="bg-white"
					type="time"
					aria-invalid={!!error}
					step="1"
					value={value}
					onChange={onChange}
				/>
			</TooltipTrigger>
			<TooltipContent>
				<p>{error}</p>
			</TooltipContent>
		</Tooltip>
	);
}
