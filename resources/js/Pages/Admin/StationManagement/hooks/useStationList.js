import { useEffect, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { getStationPagination } from "../utils";

const useStationList = ({ stations, stationLimit }) => {
    const [chartReady, setChartReady] = useState(false);
    const [stationRowsData, setStationRowsData] = useState(stations);

    useEffect(() => {
        setStationRowsData(stations);
    }, [stations]);

    useEffect(() => {
        const timer = setTimeout(() => setChartReady(true), 200);
        return () => clearTimeout(timer);
    }, []);

    const paginatedStations = stationRowsData?.data || [];
    const activePage = stationRowsData?.current_page || 1;
    const totalPages = stationRowsData?.last_page || 1;
    const totalEntries = stationRowsData?.total || 0;
    const startIndex = stationRowsData?.from || 0;
    const endIndex = stationRowsData?.to || 0;
    const paginationItems = getStationPagination(activePage, totalPages);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;

        const params = new URLSearchParams(window.location.search);
        params.set("station_page", page);
        params.set("station_limit", stationLimit);

        axios
            .get(route("stations.list"), {
                params: Object.fromEntries(params),
            })
            .then((response) => {
                setStationRowsData(response.data.stations);

                const nextParams = new URLSearchParams(window.location.search);
                nextParams.set(
                    "station_page",
                    response.data.stationPage || page,
                );
                nextParams.set(
                    "station_limit",
                    response.data.stationLimit || stationLimit,
                );

                window.history.replaceState(
                    {},
                    "",
                    `${route("stationmanagement")}?${nextParams.toString()}`,
                );
            })
            .catch((error) => {
                console.error("Failed to load station rows:", error);
            });
    };

    const openAddStationModal = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("admin_id");
        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");
        params.set("modal", "add-station");

        router.get(route("stationmanagement"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const openStationModal = (modal, station) => {
        const params = new URLSearchParams(window.location.search);

        params.delete("admin_id");
        params.set("modal", modal);
        params.set(
            "station_id",
            station.source === "sdo" ? station.station_id : station.id,
        );
        params.set(
            "station_role",
            station.source === "sdo" ? station.role : "school_admin",
        );
        params.set("station_source", station.source || "station");

        router.get(route("stationmanagement"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeStationModal = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("admin_id");
        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");

        router.get(route("stationmanagement"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
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
    };
};

export default useStationList;
