import React, { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

const EditAttendanceDialog = ({ attendance }) => {
    const payload = {};

    const [amTimeIn, setAmTimeIn] = useState(
        attendance.am?.am_time_in || "08:00"
    );
    const [amTimeOut, setAmTimeOut] = useState(
        attendance.am?.am_time_out || "12:00"
    );
    const [pmTimeIn, setPmTimeIn] = useState(
        attendance.pm?.pm_time_in || "13:00"
    );
    const [pmTimeOut, setPmTimeOut] = useState(
        attendance.pm?.pm_time_out || "17:00"
    );

    // Determine if there's any input to update
    const isDisabled =
        (!amTimeIn || attendance.am?.am_time_in) &&
        (!amTimeOut || attendance.am?.am_time_out) &&
        (!pmTimeIn || attendance.pm?.pm_time_in) &&
        (!pmTimeOut || attendance.pm?.pm_time_out);

    const handleSubmit = () => {
        const payload = {};

        if (attendance.id) {
            // Updating existing attendance
            if (!attendance.am?.am_time_in && amTimeIn)
                payload.am_time_in = amTimeIn;
            if (!attendance.am?.am_time_out && amTimeOut)
                payload.am_time_out = amTimeOut;
            if (!attendance.pm?.pm_time_in && pmTimeIn)
                payload.pm_time_in = pmTimeIn;
            if (!attendance.pm?.pm_time_out && pmTimeOut)
                payload.pm_time_out = pmTimeOut;

            router.post(
                `attendancemanagement/${attendance.id}/update`,
                payload,
                {
                    onSuccess: () => toast.success("Attendance updated!"),
                    onError: () => toast.error("Failed to update attendance"),
                }
            );
        } else {
            payload.employee_id = attendance.employee_id;
            payload.date = attendance.date;
            payload.am_time_in = amTimeIn;
            payload.am_time_out = amTimeOut;
            payload.pm_time_in = pmTimeIn;
            payload.pm_time_out = pmTimeOut;

            router.post(`attendancemanagement/create`, payload, {
                onSuccess: () => toast.success("Attendance created!"),
                onError: () => toast.error("Failed to create attendance"),
            });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="blue">Edit</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Attendance</DialogTitle>
                    <DialogDescription>
                        Update missing attendance times for{" "}
                        {attendance.employee?.first_name}{" "}
                        {attendance.employee?.last_name} on {attendance.date}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4 mt-4">
                    {/* AM Times */}
                    <div>
                        <label className="block font-semibold">
                            AM Time In
                        </label>
                        <Input
                            type="time"
                            value={amTimeIn}
                            onChange={(e) => setAmTimeIn(e.target.value)}
                            disabled={!!attendance.am?.am_time_in}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">
                            AM Time Out
                        </label>
                        <Input
                            type="time"
                            value={amTimeOut}
                            onChange={(e) => setAmTimeOut(e.target.value)}
                            disabled={!!attendance.am?.am_time_out}
                        />
                    </div>

                    {/* PM Times */}
                    <div>
                        <label className="block font-semibold">
                            PM Time In
                        </label>
                        <Input
                            type="time"
                            value={pmTimeIn}
                            onChange={(e) => setPmTimeIn(e.target.value)}
                            disabled={!!attendance.pm?.pm_time_in}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">
                            PM Time Out
                        </label>
                        <Input
                            type="time"
                            value={pmTimeOut}
                            onChange={(e) => setPmTimeOut(e.target.value)}
                            disabled={!!attendance.pm?.pm_time_out}
                        />
                    </div>

                    <DialogFooter className="flex justify-end space-x-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>

                        {/* Alert Dialog for confirmation */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="blue" disabled={isDisabled}>
                                    Save
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Confirm Update
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to save these
                                        changes and recalculate tardiness?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleSubmit}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Confirm
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditAttendanceDialog;

