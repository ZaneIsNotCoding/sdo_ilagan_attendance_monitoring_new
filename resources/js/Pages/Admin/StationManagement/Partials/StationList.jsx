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
import { Building2, AlertTriangle, SquarePen, Trash2 } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import EditStationModal from "./EditStationModal";
import AddStationModal from "./AddStationModal";
import useStationList from "../hooks/useStationList";
import { getStationHighlightKey } from "../utils";

ChartJS.register(ArcElement, Tooltip, Legend);

const StationList = ({
    stations = {},
    stationStats = {},
    stationLimit = 5,
    addStationModal = false,
    editStationModal = null,
    deleteStationModal = null,
    onAssignNow,
}) => {
    const {
        activePage,
        chartReady,
        closeStationModal,
        endIndex,
        handlePageChange,
        openAddStationModal,
        openStationModal,
        paginatedStations,
        paginationItems,
        startIndex,
        totalEntries,
        totalPages,
    } = useStationList({ stations, stationLimit });

    const assignedCount = stationStats.assigned || 0;
    const missingCount = stationStats.missing || 0;
    const visibleMissingStations = stationStats.missing_preview || [];
    const remainingMissingStations =
        missingCount - visibleMissingStations.length;

    const coverage = Math.round(
        (assignedCount / (stationStats.total || 1)) * 100,
    );

    const chartData = {
        labels: ["Assigned", "Missing"],
        datasets: [
            {
                data: [assignedCount, missingCount],
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

    return (
        <div className="flex gap-5">
            <div className="w-[60%] rounded-xl p-4 border-2 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-bold">Station List</h2>
                        <p className="text-sm text-gray-500">
                            Manage all stations
                        </p>
                    </div>

                    <Button
                        onClick={openAddStationModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        + Add Station
                    </Button>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="bg-blue-900 hover:bg-blue-800">
                                <TableHead className="text-white p-3 w-[45%]">
                                    Station Name
                                </TableHead>
                                <TableHead className="text-white p-3 w-[20%]">
                                    Code
                                </TableHead>
                                <TableHead className="text-white p-3 w-[25%] text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedStations.length > 0 ? (
                                paginatedStations.map(({ station }) => {
                                    const isSdoAssignment =
                                        station.source === "sdo";

                                    return (
                                        <TableRow key={station.id}>
                                            <TableCell className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300">
                                                        <Building2 className="w-4 h-4 text-blue-600" />
                                                    </div>

                                                    <div className="min-w-0 flex items-center gap-4">
                                                        <span className="block truncate">
                                                            {station.name}
                                                        </span>

                                                        {isSdoAssignment && (
                                                            <span className="shrink-0 text-xs font-semibold text-slate-500">
                                                                SDO
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-3 font-medium">
                                                {station.code || "-"}
                                            </TableCell>

                                            <TableCell className="p-3 text-center">
                                                <div className="flex justify-center gap-5">
                                                    <Button
                                                        onClick={() =>
                                                            openStationModal(
                                                                "edit-station",
                                                                station,
                                                            )
                                                        }
                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-blue-100 hover:bg-blue-800 hover:text-white transition"
                                                        title="Edit Station"
                                                    >
                                                        <SquarePen className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        onClick={() =>
                                                            openStationModal(
                                                                "delete-station",
                                                                station,
                                                            )
                                                        }
                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-200 text-red-600 hover:bg-red-600 hover:text-white transition"
                                                        title="Delete Station"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
                                        No Stations Found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center mt-4">
                    <div className="text-sm text-gray-500">
                        Showing {startIndex} to {endIndex} of {totalEntries}
                    </div>

                    <div className="ml-auto">
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationPrevious
                                    onClick={() =>
                                        handlePageChange(activePage - 1)
                                    }
                                />

                                <PaginationContent>
                                    {paginationItems.map((item, index) => (
                                        <PaginationItem key={index}>
                                            {item === "..." ? (
                                                <span className="px-2 text-gray-400">
                                                    ...
                                                </span>
                                            ) : (
                                                <PaginationLink
                                                    isActive={
                                                        activePage === item
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
                                        handlePageChange(activePage + 1)
                                    }
                                />
                            </Pagination>
                        )}
                    </div>
                </div>
            </div>

            <EditStationModal
                open={!!editStationModal}
                setOpen={closeStationModal}
                station={editStationModal}
            />

            <ConfirmPasswordDialog
                trigger={null}
                title={
                    deleteStationModal?.source === "sdo"
                        ? "Delete SDO Station"
                        : "Delete Station"
                }
                description="Please confirm your password before deleting this record."
                itemLabel={
                    deleteStationModal?.source === "sdo"
                        ? "SDO Station"
                        : "Station"
                }
                itemName={deleteStationModal?.name || ""}
                note={
                    deleteStationModal?.source === "sdo"
                        ? "This SDO Station row will be removed."
                        : "Employees assigned to this station will become unassigned after deletion."
                }
                action={
                    deleteStationModal?.source === "sdo"
                        ? deleteStationModal?.record_id
                            ? route(
                                  "stationassignments.destroy",
                                  deleteStationModal.record_id,
                              )
                            : ""
                        : deleteStationModal?.id
                          ? route("stations.destroy", deleteStationModal.id)
                          : ""
                }
                method="delete"
                confirmText="Delete Station"
                processingText="Deleting..."
                open={!!deleteStationModal}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) closeStationModal();
                }}
            />

            <AddStationModal
                open={addStationModal}
                setOpen={(nextOpen) => {
                    if (!nextOpen) closeStationModal();
                }}
            />

            <div className="w-[40%] flex flex-col gap-4">
                <div className="p-5 rounded-2xl shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="text-base mb-2 font-bold text-gray-800">
                        Station Coverage
                    </div>

                    <div className="flex items-center gap-8">
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

                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-900">
                                    {coverage}%
                                </span>
                            </div>
                        </div>

                        <div className="text-sm space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-700"></span>
                                <span className="text-gray-700">Assigned</span>
                                <span className="font-semibold text-gray-800">
                                    ({assignedCount})
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-gray-300"></span>
                                <span className="text-gray-700">Missing</span>
                                <span className="font-semibold text-gray-800">
                                    ({missingCount})
                                </span>
                            </div>

                            <p className="text-xs text-gray-600 pt-1">
                                {assignedCount} of {stationStats.total || 0} stations
                                covered
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 flex flex-col rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-sm h-[240px] overflow-hidden">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-500 w-4 h-4" />
                        </div>

                        <h3 className="font-semibold text-red-600">
                            Missing Stations
                        </h3>
                    </div>

                    <p className="text-sm text-red-500 mb-2">
                        These stations don&apos;t have assigned admins yet.
                    </p>

                    <div
                        className={`flex flex-wrap content-start gap-2 mb-3 flex-1 ${
                            missingCount === 0
                                ? "items-center justify-center"
                                : ""
                        }`}
                    >
                        {missingCount === 0 && (
                            <div className="text-sm text-red-600 text-center">
                                No missing stations
                            </div>
                        )}

                        {visibleMissingStations.map((station) => (
                            <button
                                key={station.id}
                                type="button"
                                onClick={() =>
                                    onAssignNow?.(
                                        getStationHighlightKey(station),
                                        station.admin_page,
                                    )
                                }
                                className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-600 hover:text-white"
                            >
                                {station.name}
                            </button>
                        ))}

                        {remainingMissingStations > 0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    onAssignNow?.(
                                        getStationHighlightKey(
                                            visibleMissingStations[0],
                                        ),
                                        visibleMissingStations[0]?.admin_page,
                                    )
                                }
                                className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-600 hover:text-white"
                            >
                                +{remainingMissingStations} more
                            </button>
                        )}
                    </div>

                    <div className="mt-auto flex justify-end">
                        {missingCount > 0 && (
                            <Button
                                onClick={() =>
                                    onAssignNow?.(
                                        getStationHighlightKey(
                                            visibleMissingStations[0],
                                        ),
                                        visibleMissingStations[0]?.admin_page,
                                    )
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

export default StationList;
