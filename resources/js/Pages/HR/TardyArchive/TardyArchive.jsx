import React from "react";
import { Head, Link } from "@inertiajs/react";
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

const TardyArchive = ({ batches }) => {
    return (
        <AuthenticatedLayout header="Tardy Records">
            <Head title="Tardy Batches" />

            <main className="flex-1 p-3">
                {batches.length === 0 ? (
                    <p className="text-gray-500">No records found.</p>
                ) : (
                    <Table>
                        <TableCaption>Summary of tardy batches</TableCaption>
                        <TableHeader>
                            <TableRow className="bg-blue-900 hover:bg-blue-800">
                                <TableHead className="text-white">
                                    Batch Code
                                </TableHead>
                                <TableHead className="text-white">
                                    Month
                                </TableHead>
                                <TableHead className="text-white">
                                    Records
                                </TableHead>
                                <TableHead className="text-white">
                                    {" "}
                                    -{" "}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches.map((batch) => (
                                <TableRow key={batch.id}>
                                    <TableCell>{batch.batch_code}</TableCell>
                                    <TableCell>{batch.month_range}</TableCell>
                                    <TableCell>{batch.count}</TableCell>
                                    <TableCell>
                                        <Link
                                            href={route(
                                                "batch-record",
                                                batch.id
                                            )}
                                            className="text-blue-600 hover:underline"
                                        >
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </main>
        </AuthenticatedLayout>
    );
};

export default TardyArchive;

