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
import EditStationModal from "./EditStationModal";
import AddStationModal from "./AddStationModal";

ChartJS.register(ArcElement, Tooltip, Legend);

const ITEMS_PER_PAGE = 5;

const getStationHighlightKey = (station) => {
    if (!station) return null;

    return `${station.source || "station"}:${
        station.source === "sdo" ? station.record_id || station.id : station.id
    }`;
};

const StationList = ({ stations = [], school_admins = [], onAssignNow }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [chartReady, setChartReady] = useState(false);
    const [openAddStationModal, setOpenAddStationModal] = useState(false);
    const [openEditStationModal, setOpenEditStationModal] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);

    const stationRows = useMemo(
        () =>
            stations.map((station) => {
                let admin = null;

                if (station.source === "station") {
                    admin = school_admins.find(
                        (a) =>
                            String(a.employee?.station_id) ===
                                String(station.id) && a.type === "school_admin",
                    );
                }

                if (station.source === "sdo") {
                    admin = school_admins.find((a) => a.type === station.role);
                }

                return {
                    station,
                    admin: admin || null,
                };
            }),
        [school_admins, stations],
    );

    const stationRecords = stationRows;

    const totalPages = Math.ceil(stationRecords.length / ITEMS_PER_PAGE);

    const paginatedStations = stationRecords.slice(
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

    const totalEntries = stationRecords.length;
    const startIndex =
        totalEntries === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalEntries);

    const assignedCount = stationRows.filter((row) => row.admin).length;
    const missingStations = stationRows.filter((row) => !row.admin);
    const visibleMissingStations = missingStations.slice(0, 6);
    const remainingMissingStations =
        missingStations.length - visibleMissingStations.length;

    const coverage = Math.round(
        (assignedCount / (stationRows.length || 1)) * 100,
    );

    const chartData = {
        labels: ["Assigned", "Missing"],
        datasets: [
            {
                data: [assignedCount, missingStations.length],
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

    useEffect(() => {
        const timer = setTimeout(() => setChartReady(true), 200);
        return () => clearTimeout(timer);
    }, []);

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
                        onClick={() => setOpenAddStationModal(true)}
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
                                    const deleteAction = isSdoAssignment
                                        ? station.record_id
                                            ? route(
                                                  "stationassignments.destroy",
                                                  station.record_id,
                                              )
                                            : ""
                                        : route("stations.destroy", station.id);

                                    return (
                                        <TableRow key={station.id}>
                                            <TableCell className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300">
                                                        <Building2 className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block truncate">
                                                            {station.name}
                                                        </span>
                                                        {isSdoAssignment && (
                                                            <span className="text-xs font-semibold text-slate-500">
                                                                SDO Station
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
                                                        onClick={() => {
                                                            setSelectedStation(
                                                                station,
                                                            );
                                                            setOpenEditStationModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-blue-100 hover:bg-blue-800 hover:text-white transition"
                                                    >
                                                        <SquarePen className="w-4 h-4" />
                                                    </Button>

                                                    <ConfirmPasswordDialog
                                                        trigger={
                                                            <Button className="w-8 h-8 flex items-center justify-center rounded-full bg-red-200 text-red-600 hover:bg-red-600 hover:text-white transition">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        }
                                                        title={
                                                            isSdoAssignment
                                                                ? "Delete SDO Station"
                                                                : "Delete Station"
                                                        }
                                                        description="Please confirm your password before deleting this record."
                                                        itemLabel={
                                                            isSdoAssignment
                                                                ? "SDO Station"
                                                                : "Station"
                                                        }
                                                        itemName={station.name}
                                                        note={
                                                            isSdoAssignment
                                                                ? "This SDO Station row will be removed."
                                                                : "Employees assigned to this station will become unassigned after deletion."
                                                        }
                                                        action={deleteAction}
                                                        method="delete"
                                                        confirmText={
                                                            isSdoAssignment
                                                                ? "Delete Station"
                                                                : "Delete Station"
                                                        }
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

            <EditStationModal
                open={openEditStationModal}
                setOpen={setOpenEditStationModal}
                station={selectedStation}
            />

            <AddStationModal
                open={openAddStationModal}
                setOpen={setOpenAddStationModal}
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
                                    ({missingStations.length})
                                </span>
                            </div>

                            <p className="text-xs text-gray-600 pt-1">
                                {assignedCount} of {stationRows.length} stations
                                covered
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 flex flex-col rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-sm h-[260px] overflow-hidden">
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
                            missingStations.length === 0
                                ? "items-center justify-center"
                                : ""
                        }`}
                    >
                        {missingStations.length === 0 && (
                            <div className="text-sm text-red-600 text-center">
                                No missing stations
                            </div>
                        )}

                        {visibleMissingStations.map(({ station }) => (
                            <button
                                key={station.id}
                                type="button"
                                onClick={() =>
                                    onAssignNow?.(
                                        getStationHighlightKey(station),
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
                                            missingStations[
                                                visibleMissingStations.length
                                            ]?.station,
                                        ),
                                    )
                                }
                                className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-600 hover:text-white"
                            >
                                +{remainingMissingStations} more
                            </button>
                        )}
                    </div>

                    <div className="mt-auto flex justify-end">
                        {missingStations.length > 0 && (
                            <Button
                                onClick={() =>
                                    onAssignNow?.(
                                        getStationHighlightKey(
                                            missingStations[0]?.station,
                                        ),
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
