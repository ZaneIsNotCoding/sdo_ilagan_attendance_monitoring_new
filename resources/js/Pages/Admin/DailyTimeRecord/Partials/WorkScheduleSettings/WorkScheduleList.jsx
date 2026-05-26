import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Clock3, SquarePen, Trash2 } from "lucide-react";
import { formatTime } from "./utils";

const WorkScheduleList = ({
    onOpenModal,
    workSchedules = [],
    workTypes = [],
}) => {
    const schedulesByType = workSchedules.reduce((groups, schedule) => {
        const typeId = String(
            schedule.work_type_id || schedule.work_type?.id || "",
        );

        return {
            ...groups,
            [typeId]: [...(groups[typeId] || []), schedule],
        };
    }, {});

    const orphanSchedules = schedulesByType[""] || [];

    return (
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">
                        Work Schedule Settings
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage work types and their time schedules
                    </p>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                    <Button
                        onClick={() => onOpenModal("add-work-type")}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        + Add Type
                    </Button>
                    <Button
                        onClick={() => onOpenModal("add-work-schedule")}
                        className="bg-slate-900 text-white hover:bg-slate-700"
                    >
                        + Add Schedule
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="w-[42%] px-3 py-2 text-white">
                                Work Type / Schedule
                            </TableHead>
                            <TableHead className="w-[18%] px-3 py-2 text-white">
                                Time In
                            </TableHead>
                            <TableHead className="w-[18%] px-3 py-2 text-white">
                                Time Out
                            </TableHead>
                            <TableHead className="w-[22%] px-3 py-2 text-center text-white">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workTypes.length ? (
                            workTypes.map((type) => {
                                const schedules =
                                    schedulesByType[String(type.id)] || [];

                                return (
                                    <React.Fragment key={type.id}>
                                        <TableRow className="h-[50px] bg-slate-50 transition hover:bg-blue-50">
                                            <TableCell className="px-3 py-2">
                                                <div className="font-semibold text-slate-900">
                                                    {type.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-sm text-slate-400">
                                                -
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-sm text-slate-400">
                                                -
                                            </TableCell>
                                            <TableCell className="px-3 py-2">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() =>
                                                            onOpenModal(
                                                                "edit-work-type",
                                                                {
                                                                    work_type_id:
                                                                        type.id,
                                                                },
                                                            )
                                                        }
                                                        className="h-8 w-8 rounded-full bg-blue-600 text-blue-100 hover:bg-blue-800 hover:text-white"
                                                        title="Edit Work Type"
                                                    >
                                                        <SquarePen className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() =>
                                                            onOpenModal(
                                                                "delete-work-type",
                                                                {
                                                                    work_type_id:
                                                                        type.id,
                                                                },
                                                            )
                                                        }
                                                        className="h-8 w-8 rounded-full bg-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                                                        title="Delete Work Type"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {schedules.length ? (
                                            schedules.map((schedule) => (
                                                <TableRow
                                                    key={schedule.id}
                                                    className="h-[48px] transition hover:bg-blue-50"
                                                >
                                                    <TableCell className="px-3 py-2">
                                                        <div className="ml-5 flex min-w-0 items-center gap-2">
                                                            <Clock3 className="h-4 w-4 shrink-0 text-blue-600" />
                                                            <span className="truncate font-medium text-slate-700">
                                                                {schedule.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2 text-sm text-slate-600">
                                                        {formatTime(
                                                            schedule.time_in,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2 text-sm text-slate-600">
                                                        {formatTime(
                                                            schedule.time_out,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2">
                                                        <div className="flex justify-center gap-2">
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    onOpenModal(
                                                                        "edit-work-schedule",
                                                                        {
                                                                            work_schedule_id:
                                                                                schedule.id,
                                                                        },
                                                                    )
                                                                }
                                                                className="h-8 w-8 rounded-full bg-blue-600 text-blue-100 hover:bg-blue-800 hover:text-white"
                                                                title="Edit Work Schedule"
                                                            >
                                                                <SquarePen className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    onOpenModal(
                                                                        "delete-work-schedule",
                                                                        {
                                                                            work_schedule_id:
                                                                                schedule.id,
                                                                        },
                                                                    )
                                                                }
                                                                className="h-8 w-8 rounded-full bg-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                                                                title="Delete Work Schedule"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow className="transition hover:bg-blue-50">
                                                <TableCell
                                                    colSpan="4"
                                                    className="px-3 py-2 pl-8 text-sm text-slate-500"
                                                >
                                                    No schedules under this
                                                    type.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="4"
                                    className="p-5 text-center text-gray-500"
                                >
                                    No work types found.
                                </TableCell>
                            </TableRow>
                        )}

                        {orphanSchedules.map((schedule) => (
                            <TableRow
                                key={schedule.id}
                                className="h-[48px] transition hover:bg-blue-50"
                            >
                                <TableCell className="px-3 py-2 font-medium">
                                    {schedule.name}
                                </TableCell>
                                <TableCell className="px-3 py-2 text-sm text-slate-600">
                                    {formatTime(schedule.time_in)}
                                </TableCell>
                                <TableCell className="px-3 py-2 text-sm text-slate-600">
                                    {formatTime(schedule.time_out)}
                                </TableCell>
                                <TableCell className="px-3 py-2">
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            onClick={() =>
                                                onOpenModal(
                                                    "edit-work-schedule",
                                                    {
                                                        work_schedule_id:
                                                            schedule.id,
                                                    },
                                                )
                                            }
                                            className="h-8 w-8 rounded-full bg-blue-600 text-blue-100 hover:bg-blue-800 hover:text-white"
                                            title="Edit Work Schedule"
                                        >
                                            <SquarePen className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            onClick={() =>
                                                onOpenModal(
                                                    "delete-work-schedule",
                                                    {
                                                        work_schedule_id:
                                                            schedule.id,
                                                    },
                                                )
                                            }
                                            className="h-8 w-8 rounded-full bg-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                                            title="Delete Work Schedule"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default WorkScheduleList;
