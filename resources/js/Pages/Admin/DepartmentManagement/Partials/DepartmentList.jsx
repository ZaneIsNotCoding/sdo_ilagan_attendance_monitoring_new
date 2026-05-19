import React from "react";
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
import { Building2, SquarePen, Trash2 } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import AddDivisionModal from "./AddDivisionModal";
import AddOfficeModal from "./AddOfficeModal";
import EditOfficeModal from "./EditOfficeModal";
import EditDivisionModal from "./EditDivisionModal";
import useDepartmentList, {
    useDepartmentPagination,
} from "../hooks/useDepartmentList";
import { ITEMS_PER_PAGE } from "../utils";

ChartJS.register(ArcElement, Tooltip, Legend);

const DepartmentList = ({
    divisions = [],
    offices = [],
    office_heads = [],
    addDivisionModal = false,
    addOfficeModal = false,
    editDivisionModal = null,
    editOfficeModal = null,
    deleteOfficeModal = null,
}) => {
    const {
        assignedCount,
        blueBlackPalette,
        chartData,
        chartOptions,
        chartReady,
        closeDepartmentModal,
        coverage,
        divisionAnalytics,
        divisionChartOptions,
        divisionPage,
        divisionSummary,
        missingOffices,
        officePage,
        openDepartmentModal,
        setDivisionPage,
        setOfficePage,
        sortedOffices,
    } = useDepartmentList({ offices, office_heads });
    const {
        paginatedDivisions,
        paginatedOffices,
        sortedDivisions,
        totalDivisionPages,
        totalOfficePages,
    } = useDepartmentPagination({
        divisionPage,
        divisions,
        officePage,
        setDivisionPage,
        setOfficePage,
        sortedOffices,
    });

    return (
        <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-xl p-4 border-2 shadow-lg">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold">Office List</h2>
                        <p className="text-sm text-gray-500">
                            Manage offices under each division
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            onClick={() => openDepartmentModal("add-office")}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            + Add Office
                        </Button>
                    </div>
                </div>

                <AddDivisionModal
                    open={addDivisionModal}
                    setOpen={(nextOpen) => {
                        if (!nextOpen) closeDepartmentModal();
                    }}
                />

                <AddOfficeModal
                    open={addOfficeModal}
                    setOpen={(nextOpen) => {
                        if (!nextOpen) closeDepartmentModal();
                    }}
                    divisions={divisions}
                />

                <EditOfficeModal
                    open={!!editOfficeModal}
                    setOpen={(nextOpen) => {
                        if (!nextOpen) closeDepartmentModal();
                    }}
                    office={editOfficeModal}
                    divisions={divisions}
                />

                <EditDivisionModal
                    open={!!editDivisionModal}
                    setOpen={(nextOpen) => {
                        if (!nextOpen) closeDepartmentModal();
                    }}
                    division={editDivisionModal}
                />

                <div className="overflow-x-auto border rounded-lg">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="bg-blue-900 hover:bg-blue-800">
                                <TableHead className="text-white text-left pl-7 pr-3 w-[40%]">
                                    Office
                                </TableHead>
                                <TableHead className="text-white text-left pl-7 pr-3 w-[35%]">
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
                                                    <span className="truncate font-medium">
                                                        {office.name}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="p-3 text-sm text-gray-600">
                                                <div className="truncate font-medium text-gray-800">
                                                    {office.division?.code}
                                                </div>
                                                <div className="truncate text-xs text-gray-500">
                                                    {office.division?.name}
                                                </div>
                                            </TableCell>

                                            <TableCell className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            openDepartmentModal(
                                                                "edit-office",
                                                                {
                                                                    office_id:
                                                                        office.id,
                                                                },
                                                            )
                                                        }
                                                        className="h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-800"
                                                        size="icon"
                                                        title="Edit Office"
                                                    >
                                                        <SquarePen className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        onClick={() =>
                                                            openDepartmentModal(
                                                                "delete-office",
                                                                {
                                                                    office_id:
                                                                        office.id,
                                                                },
                                                            )
                                                        }
                                                        className="h-8 w-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                                                        size="icon"
                                                        title="Delete Office"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
                            : (officePage - 1) * ITEMS_PER_PAGE + 1}{" "}
                        to{" "}
                        {Math.min(
                            officePage * ITEMS_PER_PAGE,
                            sortedOffices.length,
                        )}{" "}
                        of {sortedOffices.length}
                    </div>

                    <div className="ml-auto">
                        {totalOfficePages > 1 && (
                            <Pagination>
                                <PaginationPrevious
                                    onClick={() =>
                                        setOfficePage((value) =>
                                            Math.max(1, value - 1),
                                        )
                                    }
                                />
                                <PaginationContent>
                                    {Array.from(
                                        { length: totalOfficePages },
                                        (_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    isActive={
                                                        officePage === i + 1
                                                    }
                                                    onClick={() =>
                                                        setOfficePage(i + 1)
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
                                        setOfficePage((value) =>
                                            Math.min(
                                                totalOfficePages,
                                                value + 1,
                                            ),
                                        )
                                    }
                                />
                            </Pagination>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmPasswordDialog
                trigger={null}
                title="Delete Office"
                description="Please confirm your password before deleting this office."
                itemLabel="Office"
                itemName={deleteOfficeModal?.name || ""}
                note="Employees assigned to this office will become unassigned after deletion."
                action={
                    deleteOfficeModal?.id
                        ? route("office.destroy", deleteOfficeModal.id)
                        : ""
                }
                method="delete"
                confirmText="Delete Office"
                processingText="Deleting..."
                open={!!deleteOfficeModal}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) closeDepartmentModal();
                }}
            />

            <div className="flex flex-col gap-5">
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 px-5 py-3 shadow-sm">
                        <div className="mb-2 text-base font-bold text-gray-800">
                            Office Head Coverage
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="relative h-[7.5rem] w-[7.5rem] shrink-0">
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
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-md font-semibold text-gray-900">
                                        {coverage}%
                                    </span>
                                </div>
                            </div>

                            <div className="min-w-0 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 bg-blue-700" />
                                    <span className="text-gray-700">
                                        Assigned
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        ({assignedCount})
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 bg-gray-300" />
                                    <span className="text-gray-700">
                                        Missing
                                    </span>
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

                        <div className="flex items-center gap-8">
                            <div className="relative h-[7.5rem] w-[7.5rem] shrink-0">
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

                            <div className="min-w-0 space-y-2 text-sm">
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
                                    {Object.keys(divisionSummary).length}{" "}
                                    divisions total
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl p-4 border-2 shadow-lg">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold">Division List</h2>
                            <p className="text-sm text-gray-500">
                                Manage division records
                            </p>
                        </div>

                        <Button
                            onClick={() => openDepartmentModal("add-division")}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            + Add Division
                        </Button>
                    </div>

                    <div className="overflow-x-auto border rounded-lg">
                        <Table className="w-full table-fixed">
                            <TableHeader>
                                <TableRow className="bg-blue-900 hover:bg-blue-800">
                                    <TableHead className="text-white text-left pl-7 pr-3 w-[60%]">
                                        Division
                                    </TableHead>
                                    <TableHead className="text-white p-3 w-[40%] text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedDivisions.length > 0 ? (
                                    paginatedDivisions.map((division) => (
                                        <TableRow key={division.id}>
                                            <TableCell className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300">
                                                        <Building2 className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">
                                                            {division.name}
                                                        </div>
                                                        <div className="truncate text-xs text-gray-500">
                                                            {division.code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            openDepartmentModal(
                                                                "edit-division",
                                                                {
                                                                    division_id:
                                                                        division.id,
                                                                },
                                                            )
                                                        }
                                                        className="h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-800"
                                                        size="icon"
                                                        title="Edit Division"
                                                    >
                                                        <SquarePen className="h-4 w-4" />
                                                    </Button>

                                                    <ConfirmPasswordDialog
                                                        title="Delete Division"
                                                        description="Please confirm your password before deleting this division."
                                                        itemLabel="Division"
                                                        itemName={
                                                            division.name || ""
                                                        }
                                                        note="Offices under this division may be affected after deletion."
                                                        action={route(
                                                            "department.destroy",
                                                            division.id,
                                                        )}
                                                        method="delete"
                                                        confirmText="Delete Division"
                                                        processingText="Deleting..."
                                                        trigger={
                                                            <Button
                                                                className="h-8 w-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                                                                size="icon"
                                                                title="Delete Division"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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
                                            No Divisions Found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 flex items-center">
                        <div className="text-sm text-gray-500">
                            Showing{" "}
                            {sortedDivisions.length === 0
                                ? 0
                                : (divisionPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                            to{" "}
                            {Math.min(
                                divisionPage * ITEMS_PER_PAGE,
                                sortedDivisions.length,
                            )}{" "}
                            of {sortedDivisions.length}
                        </div>

                        <div className="ml-auto">
                            {totalDivisionPages > 1 && (
                                <Pagination>
                                    <PaginationPrevious
                                        onClick={() =>
                                            setDivisionPage((value) =>
                                                Math.max(1, value - 1),
                                            )
                                        }
                                    />
                                    <PaginationContent>
                                        {Array.from(
                                            { length: totalDivisionPages },
                                            (_, i) => (
                                                <PaginationItem key={i}>
                                                    <PaginationLink
                                                        isActive={
                                                            divisionPage ===
                                                            i + 1
                                                        }
                                                        onClick={() =>
                                                            setDivisionPage(
                                                                i + 1,
                                                            )
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
                                            setDivisionPage((value) =>
                                                Math.min(
                                                    totalDivisionPages,
                                                    value + 1,
                                                ),
                                            )
                                        }
                                    />
                                </Pagination>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentList;
