import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

const TardyRecordBatch = ({ batch, records }) => {
    const [selected, setSelected] = useState(null);

    return (
        <AuthenticatedLayout header={`Batch ${batch.batch_code} Records`}>
            <Head title={`Batch ${batch.batch_code}`} />

            <main className="flex-1 p-3">
                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">
                        Batch: {batch.batch_code} ({batch.month_range})
                    </h3>

                    {records.length === 0 ? (
                        <p className="text-gray-500">
                            No records found for this batch.
                        </p>
                    ) : (
                        <Table>
                            <TableCaption>
                                Tardiness conversions for batch{" "}
                                {batch.batch_code}
                            </TableCaption>
                            <TableHeader>
                                <TableRow className="bg-blue-900 hover:bg-blue-800">
                                    <TableHead>Employee Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Total Tardy</TableHead>
                                    <TableHead>Equivalent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((rec) => (
                                    <TableRow key={rec.id}>
                                        <TableCell>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button
                                                        onClick={() =>
                                                            setSelected(rec)
                                                        }
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {rec.employee
                                                            ? `${rec.employee.first_name} ${rec.employee.last_name}`
                                                            : "N/A"}
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className="max-h-[80vh] w-[90vw] md:w-[600px] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            {rec.employee
                                                                ? `${rec.employee.first_name} ${rec.employee.last_name}`
                                                                : "Employee"}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Daily tardiness
                                                            records for
                                                            conversion #{rec.id}
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    {/* Daily tardy table */}
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="bg-blue-900 hover:bg-blue-800">
                                                                <TableHead>
                                                                    Date
                                                                </TableHead>
                                                                <TableHead>
                                                                    AM Tardy
                                                                </TableHead>
                                                                <TableHead>
                                                                    PM Tardy
                                                                </TableHead>
                                                                <TableHead>
                                                                    Total Tardy
                                                                </TableHead>
                                                                <TableHead>
                                                                    Converted
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {rec
                                                                .tardiness_records
                                                                ?.length > 0 ? (
                                                                rec.tardiness_records.map(
                                                                    (daily) => (
                                                                        <TableRow
                                                                            key={
                                                                                daily.id
                                                                            }
                                                                        >
                                                                            <TableCell>
                                                                                {
                                                                                    daily.date
                                                                                }
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {
                                                                                    daily.am_tardy
                                                                                }
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {
                                                                                    daily.pm_tardy
                                                                                }
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {
                                                                                    daily.total_tardy
                                                                                }
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {
                                                                                    daily.converted_tardy
                                                                                }
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                                )
                                                            ) : (
                                                                <TableRow>
                                                                    <TableCell
                                                                        colSpan="4"
                                                                        className="text-center"
                                                                    >
                                                                        No daily
                                                                        records
                                                                        found.
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>

                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="secondary">
                                                                Close
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>

                                        <TableCell>
                                            {rec.employee?.department ?? ""}
                                        </TableCell>
                                        <TableCell>{rec.total_tardy}</TableCell>
                                        <TableCell>
                                            {rec.total_equivalent}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default TardyRecordBatch;

