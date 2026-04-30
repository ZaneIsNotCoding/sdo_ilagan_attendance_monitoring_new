import React, { useEffect, useMemo, useState } from "react";
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
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import AddDivisionModal from "./AddDivisionModal";
import AddOfficeModal from "./AddOfficeModal";
import EditOfficeModal from "./EditOfficeModal";

ChartJS.register(ArcElement, Tooltip, Legend);

const ITEMS_PER_PAGE = 7;

const DepartmentList = ({
    divisions = [],
    offices = [],
    office_heads = [],
    onAssignNow,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [openDivisionModal, setOpenDivisionModal] = useState(false);
    const [openOfficeModal, setOpenOfficeModal] = useState(false);
    const [openEditOffice, setOpenEditOffice] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState(null);

    const sortedOffices = [...offices].sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || ""),
    );

    const totalPages = Math.max(
        Math.ceil(sortedOffices.length / ITEMS_PER_PAGE),
        1,
    );
    const paginatedOffices = sortedOffices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const assignedCount = sortedOffices.filter((office) =>
        office_heads.some((h) => h.employee?.office_id === office.id),
    ).length;

    const missingOffices = sortedOffices.filter(
        (office) =>
            !office_heads.some((h) => h.employee?.office_id === office.id),
    );

    const coverage = Math.round(
        (assignedCount / (sortedOffices.length || 1)) * 100,
    );

    const blueBlackPalette = [
        "#0f172a",
        "#1d4ed8",
        "#2563eb",
        "#475569",
        "#93c5fd",
    ];

    const chartData = {
        labels: ["Assigned", "Missing"],
        datasets: [
            {
                data: [assignedCount, missingOffices.length],
                backgroundColor: ["#1d4ed8", "#d1d5db"],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: { legend: { display: false } },
    };

    const divisionAnalytics = useMemo(() => {
        const grouped = offices.reduce((acc, office) => {
            const divisionName =
                office?.division?.code || office?.division?.name || "Unknown";
            acc[divisionName] = (acc[divisionName] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(grouped);
        const values = Object.values(grouped);

        return {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: labels.map(
                        (_, index) =>
                            blueBlackPalette[index % blueBlackPalette.length],
                    ),
                    borderWidth: 0,
                },
            ],
        };
    }, [offices]);

    const divisionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: { legend: { display: false } },
    };

    const divisionSummary = useMemo(() => {
        return offices.reduce((acc, office) => {
            const key =
                office?.division?.code || office?.division?.name || "Unknown";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }, [offices]);

    const [chartReady, setChartReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setChartReady(true), 200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex gap-5">
            <div className="w-[60%] rounded-xl p-4 border-2 shadow-lg">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold">Office List</h2>
                        <p className="text-sm text-gray-500">
                            Manage offices under each division
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            onClick={() => setOpenDivisionModal(true)}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            + Add Division
                        </Button>
                        <Button
                            onClick={() => setOpenOfficeModal(true)}
                            className="bg-slate-900 text-white hover:bg-slate-700"
                        >
                            + Add Office
                        </Button>
                    </div>
                </div>

                <AddDivisionModal
                    open={openDivisionModal}
                    setOpen={setOpenDivisionModal}
                />

                <AddOfficeModal
                    open={openOfficeModal}
                    setOpen={setOpenOfficeModal}
                    divisions={divisions}
                />

                <EditOfficeModal
                    open={openEditOffice}
                    setOpen={setOpenEditOffice}
                    office={selectedOffice}
                    divisions={divisions}
                />

                <div className="overflow-x-auto border rounded-lg">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="bg-blue-900 hover:bg-blue-800">
                                <TableHead className="text-white text-left pl-7 pr-3 w-[35%]">
                                    Office
                                </TableHead>
                                <TableHead className="text-white text-left pl-7 pr-3 w-[40%]">
                                    Division
                                </TableHead>
                                <TableHead className="text-white p-3 w-[20%] text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedOffices.length > 0 ? (
                                paginatedOffices.map((office) => {
                                    return (
                                        <TableRow key={office.id}>
                                            <TableCell className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300">
                                                        <Building2 className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-medium">
                                                        {office.name}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="p-3 text-sm text-gray-600">
                                                <div className="font-medium text-gray-800">
                                                    {office.division?.code}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {office.division?.name}
                                                </div>
                                            </TableCell>

                                            <TableCell className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedOffice(
                                                                office,
                                                            );
                                                            setOpenEditOffice(
                                                                true,
                                                            );
                                                        }}
                                                        className="h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-800"
                                                        size="icon"
                                                    >
                                                        <SquarePen className="h-4 w-4" />
                                                    </Button>

                                                    <ConfirmPasswordDialog
                                                        trigger={
                                                            <Button
                                                                className="h-8 w-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                                                                size="icon"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        }
                                                        title="Delete Office"
                                                        description="Please confirm your password before deleting this office."
                                                        itemLabel="Office"
                                                        itemName={office.name}
                                                        note="Employees assigned to this office will become unassigned after deletion."
                                                        action={route(
                                                            "office.destroy",
                                                            office.id,
                                                        )}
                                                        method="delete"
                                                        confirmText="Delete Office"
                                                        processingText="Deleting..."
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan="3"
                                        className="p-5 text-center text-gray-500"
                                    >
                                        No Offices Found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4 flex items-center">
                    <div className="text-sm text-gray-500">
                        Showing{" "}
                        {sortedOffices.length === 0
                            ? 0
                            : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                        to{" "}
                        {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            sortedOffices.length,
                        )}{" "}
                        of {sortedOffices.length}
                    </div>

                    <div className="ml-auto">
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationPrevious
                                    onClick={() =>
                                        setCurrentPage((value) =>
                                            Math.max(1, value - 1),
                                        )
                                    }
                                />
                                <PaginationContent>
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    isActive={
                                                        currentPage === i + 1
                                                    }
                                                    onClick={() =>
                                                        setCurrentPage(i + 1)
                                                    }
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ),
                                    )}
                                </PaginationContent>
                                <PaginationNext
                                    onClick={() =>
                                        setCurrentPage((value) =>
                                            Math.min(totalPages, value + 1),
                                        )
                                    }
                                />
                            </Pagination>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-[40%] flex flex-col gap-2">
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 px-5 py-3 shadow-sm">
                    <div className="mb-2 text-base font-bold text-gray-800">
                        Office Head Coverage
                    </div>

                    <div className="flex items-center gap-16">
                        <div className="relative ml-5 h-32 w-32 shrink-0">
                            <Doughnut
                                data={
                                    chartReady
                                        ? chartData
                                        : {
                                              ...chartData,
                                              datasets: [
                                                  {
                                                      ...chartData.datasets[0],
                                                      data: [0, 0],
                                                  },
                                              ],
                                          }
                                }
                                options={chartOptions}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-md font-semibold text-gray-900">
                                    {coverage}%
                                </span>
                            </div>
                        </div>

                        <div className="min-w-0 space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 bg-blue-700" />
                                <span className="text-gray-700">Assigned</span>
                                <span className="font-semibold text-gray-800">
                                    ({assignedCount})
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 bg-gray-300" />
                                <span className="text-gray-700">Missing</span>
                                <span className="font-semibold text-gray-800">
                                    ({missingOffices.length})
                                </span>
                            </div>

                            <p className="pt-1 text-xs text-gray-600">
                                {assignedCount} of {sortedOffices.length}{" "}
                                offices covered
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-100 px-5 py-3 shadow-sm">
                    <div className="mb-2 text-base font-bold text-gray-800">
                        Offices per Division
                    </div>

                    <div className="flex items-center gap-16">
                        <div className="relative ml-5 h-32 w-32 shrink-0">
                            <Doughnut
                                data={
                                    chartReady
                                        ? divisionAnalytics
                                        : {
                                              ...divisionAnalytics,
                                              datasets: [
                                                  {
                                                      ...divisionAnalytics
                                                          .datasets[0],
                                                      data: divisionAnalytics.datasets[0].data.map(
                                                          () => 0,
                                                      ),
                                                  },
                                              ],
                                          }
                                }
                                options={divisionChartOptions}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-md font-semibold text-gray-900">
                                    {sortedOffices.length}
                                </span>
                            </div>
                        </div>

                        <div className="min-w-0 space-y-3 text-sm">
                            {Object.entries(divisionSummary)
                                .slice(0, 3)
                                .map(([division, count], index) => (
                                    <div
                                        key={division}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className="h-3 w-3"
                                            style={{
                                                backgroundColor:
                                                    blueBlackPalette[
                                                        index %
                                                            blueBlackPalette.length
                                                    ],
                                            }}
                                        />
                                        <span className="truncate text-gray-700">
                                            {division}
                                        </span>
                                        <span className="font-semibold text-gray-800">
                                            ({count})
                                        </span>
                                    </div>
                                ))}

                            <p className="pt-1 text-xs text-gray-600">
                                {Object.keys(divisionSummary).length} divisions
                                total
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 flex flex-col rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-sm min-h-[240px] h-auto">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-500 w-4 h-4" />
                        </div>

                        <h3 className="font-semibold text-red-600">
                            Missing Offices
                        </h3>
                    </div>

                    <p className="text-sm text-red-500 mb-2">
                        These offices don&apos;t have assigned heads yet.
                    </p>

                    <div
                        className={`flex flex-wrap gap-2 mb-3 ${
                            missingOffices.length === 0
                                ? "flex-1 items-center justify-center"
                                : ""
                        }`}
                    >
                        {missingOffices.length === 0 && (
                            <div className="text-sm text-red-600 text-center">
                                No missing offices
                            </div>
                        )}

                        {missingOffices.length > 0 &&
                            missingOffices.slice(0, 8).map((office) => (
                                <button
                                    key={office.id}
                                    type="button"
                                    onClick={() => onAssignNow?.(office.id)}
                                    className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-600 hover:text-white"
                                >
                                    {office.name}
                                </button>
                            ))}

                        {missingOffices.length > 9 && (
                            <button
                                type="button"
                                onClick={() =>
                                    onAssignNow?.(missingOffices[8]?.id)
                                }
                                className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-600 hover:text-white"
                            >
                                +{missingOffices.length - 8} more
                            </button>
                        )}
                    </div>

                    <div className="mt-auto flex justify-end">
                        {missingOffices.length > 0 && (
                            <Button
                                onClick={() =>
                                    onAssignNow?.(missingOffices[0]?.id)
                                }
                                className="text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                            >
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
