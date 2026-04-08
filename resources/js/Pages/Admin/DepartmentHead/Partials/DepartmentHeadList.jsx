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
import { Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import AddDepartmentHead from "./AddDepartmentHeadForm";

const ITEMS_PER_PAGE = 10;

const DepartmentHeadList = ({
    dept_heads,
    employees,
    assignedDepartments,
    departments = [],
}) => {
    const [openAdd, setOpenAdd] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(dept_heads.length / ITEMS_PER_PAGE);

    const paginatedHeads = dept_heads.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
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
            " "
        );
    };

    return (
        <div className="bg-white shadow rounded-xl">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-lg font-bold">
                        Department Head List
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage department head assignments
                    </p>
                </div>

                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setOpenAdd(true)}
                >
                    + Add Head
                </Button>
            </div>

            {/* ADD FORM */}
            <AddDepartmentHead
                open={openAdd}
                setOpen={setOpenAdd}
                employees={employees}
                assignedDepartments={assignedDepartments}
                departments={departments}
            />

            {/* TABLE */}
            <div className="overflow-hidden border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-blue-900">
                            <TableHead className="text-white text-left p-3">
                                Employee
                            </TableHead>
                            <TableHead className="text-white text-left p-3">
                                Position
                            </TableHead>
                            <TableHead className="text-white text-left p-3">
                                Department
                            </TableHead>
                            <TableHead className="text-white text-center p-3">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedHeads.length > 0 ? (
                            paginatedHeads.map((emp) => (
                                <TableRow
                                    key={emp.id}
                                    className="hover:bg-gray-50 transition"
                                >
                                    {/* EMPLOYEE */}
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                {getFullName(emp.employee)
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </div>

                                            <div>
                                                <div className="font-medium">
                                                    {getFullName(emp.employee)}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* POSITION */}
                                    <TableCell className="p-3 text-gray-700">
                                        {emp.employee?.position || "-"}
                                    </TableCell>

                                    {/* DEPARTMENT (FIXED) */}
                                    <TableCell className="p-3">
                                        <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                                            {getDepartmentName(
                                                emp.employee?.department_id
                                            )}
                                        </span>
                                    </TableCell>

                                    {/* ACTIONS */}
                                    <TableCell className="p-3 text-center">
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
                                            itemName={getFullName(emp.employee)}
                                            action={route(
                                                "departmenthead.destroy",
                                                emp.id
                                            )}
                                            method="delete"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="4"
                                    className="text-center p-5 text-gray-500"
                                >
                                    No Department Heads Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <Pagination className="mt-4 justify-end">
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
                                    onClick={() => handlePageChange(i + 1)}
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
    );
};

export default DepartmentHeadList;