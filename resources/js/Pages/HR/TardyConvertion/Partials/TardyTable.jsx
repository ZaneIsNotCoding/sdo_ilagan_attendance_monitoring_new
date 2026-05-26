import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const TardyTable = ({ groupedByEmployee, monthRangeLabel }) => (
    <Table>
        <TableHeader>
            <TableRow className="bg-blue-900 hover:bg-blue-800">
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Total Tardy</TableHead>
                <TableHead>Equiv Day in Hours</TableHead>
                <TableHead>Equiv Day in Minutes</TableHead>
                <TableHead>Total</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {groupedByEmployee.map((record, idx) => (
                <TableRow key={`${record.name}-${record.dept}-${idx}`}>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.dept}</TableCell>
                    <TableCell>{monthRangeLabel}</TableCell>
                    <TableCell>{record.total_tardy.toFixed(2)}</TableCell>
                    <TableCell>{record.equi_hours.toFixed(3)}</TableCell>
                    <TableCell>{record.equi_mins.toFixed(3)}</TableCell>
                    <TableCell>{record.total_equi.toFixed(3)}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

