import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Building2, AlertTriangle, SquarePen, Trash2 } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import AddDepartmentModal from "./AddDepartmentModal";
import EditDepartment from "./EditDepartment";
import DeleteDepartmentModal from "./DeleteDepartmentModal";

ChartJS.register(ArcElement, Tooltip, Legend);

const ITEMS_PER_PAGE = 5;

const DepartmentList = ({ departments = [], dept_heads, onAssignNow }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [openDepartmentAddmodal, setopenDepartmentAddmodal] = useState(false);
    const [openEditDepartment, setOpenEditDepartment] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const totalPages = Math.ceil(departments.length / ITEMS_PER_PAGE);

    const paginatedDepartments = departments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const getPagination = () => {
        const pages = [];

        if (totalPages <= 4) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 2) {
                pages.push("...");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 1) {
                pages.push("...");
            }

            pages.push(totalPages);
        }

        return pages;
    };

    const totalEntries = departments.length;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, departments.length);

    const assignedCount = departments.filter((d) =>
        dept_heads.some((h) => h.employee?.department_id === d.id),
    ).length;

    const missingDepartments = departments.filter(
        (d) => !dept_heads.some((h) => h.employee?.department_id === d.id),
    );

    const coverage = Math.round(
        (assignedCount / (departments.length || 1)) * 100,
    );
    const chartData = {
        labels: ["Assigned", "Missing"],
        datasets: [
            {
                data: [assignedCount, missingDepartments.length],
                backgroundColor: ["#1d4ed8", "#d1d5db"],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,

        cutout: "65%",

        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: "easeOutCubic",
        },

        plugins: {
            legend: { display: false },
        },
    };

    const [chartReady, setChartReady] = useState(false);

    React.useEffect(() => {
        setTimeout(() => setChartReady(true), 200);
    }, []);

    return (
        <div className="flex gap-5">
            {/* LEFT SIDE: TABLE ONLY */}
            <div className="w-[60%] rounded-xl p-4 border-2 shadow-lg ">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-bold">Department List</h2>
                        <p className="text-sm text-gray-500">
                            Manage all departments
                        </p>
                    </div>

                    <Button
                        onClick={() => setopenDepartmentAddmodal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        + Add Department
                    </Button>
                </div>
                <AddDepartmentModal
                    open={openDepartmentAddmodal}
                    setOpen={setopenDepartmentAddmodal}
                />
                <div className="overflow-x-auto border rounded-lg">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="bg-blue-900 hover:bg-blue-800">
                                <TableHead className="text-white p-3 w-[60%]">
                                    Department Name
                                </TableHead>

                                <TableHead className="text-white p-3 w-[30%] text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedDepartments.length > 0 ? (
                                paginatedDepartments.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300">
                                                    <Building2 className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span>{dept.name}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3 text-center">
                                            <div className="flex justify-center gap-5">
                                                <Button
                                                    onClick={() => {
                                                        setSelectedDepartment(
                                                            dept,
                                                        );
                                                        setOpenEditDepartment(
                                                            true,
                                                        );
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-blue-100 hover:bg-blue-800 hover:text-white transition"
                                                >
                                                    <SquarePen className="w-4 h-4" />
                                                </Button>
                                                <EditDepartment
                                                    open={openEditDepartment}
                                                    setOpen={
                                                        setOpenEditDepartment
                                                    }
                                                    department={
                                                        selectedDepartment
                                                    }
                                                />

                                                <DeleteDepartmentModal
                                                    department={dept}
                                                    trigger={
                                                        <Button className="w-8 h-8 flex items-center justify-center rounded-full bg-red-200 text-red-600 hover:bg-red-600 hover:text-white transition">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan="2"
                                        className="p-5 text-center text-gray-500"
                                    >
                                        No Departments Found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* PAGINATION */}
                <div className="flex items-center mt-4">
                    <div className="text-sm text-gray-500">
                        Showing {startIndex} to {endIndex} of {totalEntries}
                    </div>

                    <div className="ml-auto">
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationPrevious
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                />

                                <PaginationContent>
                                    {getPagination().map((item, index) => (
                                        <PaginationItem key={index}>
                                            {item === "..." ? (
                                                <span className="px-2 text-gray-400">
                                                    ...
                                                </span>
                                            ) : (
                                                <PaginationLink
                                                    isActive={
                                                        currentPage === item
                                                    }
                                                    onClick={() =>
                                                        handlePageChange(item)
                                                    }
                                                >
                                                    {item}
                                                </PaginationLink>
                                            )}
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

            <div className="w-[40%] flex flex-col gap-4">
                {/* 🔷 TOP ROW */}
                <div>
                    {/* COVERAGE CARD */}
                    <div className="p-5 rounded-2xl shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="text-base mb-2 font-bold text-gray-800">
                            Department Head Coverage
                        </div>
                        <div className="flex items-center gap-8">
                            {/* DONUT */}
                            <div className="relative w-44 ms-2">
                                <div className="w-full h-full">
                                    <Doughnut
                                        data={
                                            chartReady
                                                ? chartData
                                                : {
                                                      ...chartData,
                                                      datasets: [
                                                          {
                                                              ...chartData
                                                                  .datasets[0],
                                                              data: [0, 0],
                                                          },
                                                      ],
                                                  }
                                        }
                                        options={chartOptions}
                                    />
                                </div>

                                {/* CENTER TEXT */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {coverage}%
                                    </span>
                                </div>
                            </div>

                            {/* LEGEND */}
                            <div className="text-sm space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-blue-700"></span>
                                    <span className="text-gray-700">
                                        Assigned
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        ({assignedCount})
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-gray-300"></span>
                                    <span className="text-gray-700">
                                        Missing
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        ({missingDepartments.length})
                                    </span>
                                </div>

                                <p className="text-xs text-gray-600 pt-1">
                                    {assignedCount} of {departments.length}{" "}
                                    departments covered
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔴 MISSING DEPARTMENTS */}
                <div className="p-5 flex flex-col rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-sm min-h-[240px] h-auto">
                    {/* HEADER */}
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-500 w-4 h-4" />
                        </div>

                        <h3 className="font-semibold text-red-600">
                            Missing Departments
                        </h3>
                    </div>

                    <p className="text-sm text-red-500 mb-2">
                        These departments don’t have assigned heads yet.
                    </p>

                    {/* CONTENT AREA */}
                    <div
                        className={`flex flex-wrap gap-2 mb-3 ${
                            missingDepartments.length === 0
                                ? "flex-1 items-center justify-center"
                                : ""
                        }`}
                    >
                        {missingDepartments.length === 0 && (
                            <div className="text-sm text-red-600 text-center">
                                No missing departments 🎉
                            </div>
                        )}

                        {missingDepartments.length > 0 &&
                            missingDepartments.slice(0, 10).map((dept) => (
                                <span
                                    key={dept.id}
                                    className="px-3 py-1 text-xs font-medium bg-white border border-red-200 text-red-600 rounded-full shadow-sm"
                                >
                                    {dept.name}
                                </span>
                            ))}
                    </div>

                    {/* BUTTON */}
                    <div
                        onClick={onAssignNow}
                        className="mt-auto flex justify-end"
                    >
                        {missingDepartments.length > 0 && (
                            <Button className="text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm">
                                Assign Now
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentList;
