import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, Building2, CheckCircle2, XCircle } from "lucide-react";
import React, { useState } from "react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import AddDepartmentHeadForm from "./AddDepartmentHeadForm";

const ITEMS_PER_PAGE = 10;

const DepartmentHeadList = ({ dept_heads, employees, departments = [] }) => {
    const [openAdd, setOpenAdd] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDeptForAssign, setSelectedDeptForAssign] = useState(null);

    const departmentRows = departments.map((dept) => {
        const head = dept_heads.find(
            (h) => h.employee?.department_id === dept.id,
        );

        return {
            department: dept,
            head: head || null,
        };
    });

    const totalPages = Math.ceil(departmentRows.length / ITEMS_PER_PAGE);

    const paginatedRows = departmentRows.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // 🔥 helper: get department name from ID
    const getDepartmentName = (id) => {
        return departments.find((d) => d.id === id)?.name || "-";
    };

    // 🔥 fallback full name (safe even without accessor)
    const getFullName = (emp) => {
        if (!emp) return "-";
        return `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`.replace(
            /\s+/g,
            " ",
        );
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(
        currentPage * ITEMS_PER_PAGE,
        departmentRows.length,
    );
    const totalEntries = departmentRows.length;

    return (
        <div className=" rounded-xl">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-lg font-bold">Department Head List</h2>
                    <p className="text-sm text-gray-500">
                        Manage department head assignments
                    </p>
                </div>
            </div>

            {/* ADD FORM */}
            <AddDepartmentHeadForm
                open={openAdd}
                setOpen={setOpenAdd}
                employees={employees}
                departments={departments}
                preselectedDept={selectedDeptForAssign}
            />

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-lg">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="text-white text-left px-10 w-[20%]">
                                Employee Name
                            </TableHead>
                            <TableHead className="text-white p-3 w-[18%]">
                                Position
                            </TableHead>
                            <TableHead className="text-white p-3 w-[22%]">
                                Department
                            </TableHead>
                            <TableHead className="text-white p-3 w-[10%]">
                                Status
                            </TableHead>
                            <TableHead className="text-white p-3 w-[10%]">
                                Date Assigned
                            </TableHead>
                            <TableHead className="text-white text-center p-3 w-[10%]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((row, index) => {
                                const emp = row.head?.employee;

                                return (
                                    <TableRow
                                        key={index}
                                        className={`h-[64px] transition ${
                                            !row.head
                                                ? "bg-gray-100 hover:bg-gray-200"
                                                : "bg-white hover:bg-blue-50"
                                        }`}
                                    >
                                        {/* EMPLOYEE */}
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-blue-300 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                    {emp
                                                        ? getFullName(emp)
                                                              .split(" ")
                                                              .map((n) => n[0])
                                                              .join("")
                                                        : "-"}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">
                                                        {emp
                                                            ? getFullName(emp)
                                                            : "No Head Assigned"}
                                                    </div>
                                                    {emp && (
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {emp.email || ""}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* POSITION */}
                                        <TableCell className="p-3 text-gray-700 truncate">
                                            {emp?.position || "-"}
                                        </TableCell>

                                        {/* DEPARTMENT */}
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                    <Building2 className="w-4 h-4 text-blue-600" />
                                                </div>

                                                <span className="px-3 py-1 text-sm rounded truncate">
                                                    {row.department.name}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* STATUS */}
                                        <TableCell className="p-3">
                                            {row.head ? (
                                                <span className="min-w-[90px] justify-center px-2 py-1 text-xs font-semibold bg-green-200 text-green-800 rounded-full inline-flex items-center gap-2">
                                                    <CheckCircle2 size={14} />
                                                    Assigned
                                                </span>
                                            ) : (
                                                <span className="min-w-[90px] justify-center px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 rounded-full inline-flex items-center gap-2">
                                                    <XCircle size={14} />
                                                    Missing
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* DATE */}
                                        <TableCell className="p-3 truncate">
                                            {row.head
                                                ? new Date(
                                                      row.head.created_at,
                                                  ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                          year: "numeric",
                                                          month: "short",
                                                          day: "numeric",
                                                      },
                                                  )
                                                : "-"}
                                        </TableCell>

                                        {/* ACTIONS */}
                                        <TableCell className="p-3 text-center">
                                            {row.head ? (
                                                <ConfirmPasswordDialog
                                                    trigger={
                                                        <Button
                                                            size="icon"
                                                            className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                    title="Delete Department Head"
                                                    description="You are about to permanently remove this department head assignment."
                                                    itemLabel="Department Head"
                                                    itemName={getFullName(emp)}
                                                    action={route(
                                                        "departmenthead.destroy",
                                                        row.head.id,
                                                    )}
                                                    method="delete"
                                                />
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="min-w-[90px] bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white"
                                                    onClick={() => {
                                                        setSelectedDeptForAssign(
                                                            row.department.id,
                                                        );
                                                        setOpenAdd(true);
                                                    }}
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="6"
                                    className="text-center p-5 text-gray-500"
                                >
                                    No Departments Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center mt-4">
                {/* LEFT TEXT */}
                <div className="text-sm text-gray-500 font-medium">
                    Showing {startIndex} to {endIndex} of {totalEntries} entries
                </div>

                {/* PUSH PAGINATION TO RIGHT */}
                <div className="ml-auto">
                    {totalPages > 1 && (
                        <Pagination className="w-auto">
                            <PaginationPrevious
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                            />

                            <PaginationContent>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={currentPage === i + 1}
                                            onClick={() =>
                                                handlePageChange(i + 1)
                                            }
                                            className="text-sm"
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                            </PaginationContent>

                            <PaginationNext
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                            />
                        </Pagination>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepartmentHeadList;
