import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import {
    getStationHighlightKey,
    getWidePagination,
} from "../utils";
import { getEmployeeName, sortAlphabetically } from "@/lib/utils";

const useStationAdminList = ({
    adminLimit,
    highlightedStationId,
    highlightRequestKey,
    search,
    stationRows,
}) => {
    const [animatedStationId, setAnimatedStationId] = useState(null);
    const [stationRowsData, setStationRowsData] = useState(stationRows);
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const animationTimeoutRef = useRef(null);
    const suggestionRequestRef = useRef(0);
    const searchBoxRef = useRef(null);

    useEffect(() => {
        setSearchTerm(search || "");
    }, [search]);

    useEffect(() => {
        setStationRowsData(stationRows);
    }, [stationRows]);

    const visibleStationRows = stationRowsData?.data || [];
    const activePage = stationRowsData?.current_page || 1;
    const totalPages = stationRowsData?.last_page || 1;
    const totalEntries = stationRowsData?.total || 0;
    const startIndex = stationRowsData?.from || 0;
    const endIndex = stationRowsData?.to || 0;
    const pageNumbers = useMemo(
        () => getWidePagination(activePage, totalPages),
        [activePage, totalPages],
    );

    useEffect(() => {
        const query = searchTerm.trim();

        if (!query) {
            setSuggestionMatches([]);
            setSuggestionsLoading(false);
            return;
        }

        setSuggestionsLoading(true);
        const requestId = suggestionRequestRef.current + 1;
        suggestionRequestRef.current = requestId;

        const timeout = setTimeout(() => {
            axios
                .get(route("stations.suggestions"), {
                    params: { search: query },
                })
                .then((response) => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionMatches(
                        sortAlphabetically(response.data || [], "name").map(
                            (station) => ({
                                id: `${station.source || "station"}:${
                                    station.record_id || station.id
                                }`,
                                label: station.name,
                                meta: station.code
                                    ? `${station.code}`
                                    : "No code",
                                search: station.name,
                            }),
                        ),
                    );
                })
                .catch(() => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionMatches([]);
                })
                .finally(() => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionsLoading(false);
                });
        }, 250);

        return () => {
            clearTimeout(timeout);
        };
    }, [searchTerm]);

    const highlightedStationIndex = useMemo(
        () =>
            visibleStationRows.findIndex(
                (row) =>
                    String(getStationHighlightKey(row.station)) ===
                    String(highlightedStationId),
            ),
        [highlightedStationId, visibleStationRows],
    );

    useEffect(() => {
        if (highlightedStationId == null || highlightedStationIndex < 0) {
            return;
        }

        setAnimatedStationId(highlightedStationId);

        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        animationTimeoutRef.current = setTimeout(() => {
            setAnimatedStationId(null);
        }, 2200);
    }, [highlightedStationId, highlightedStationIndex, highlightRequestKey]);

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const openAssignModal = (station) => {
        const params = new URLSearchParams(window.location.search);

        params.delete("admin_id");
        params.set("modal", "station-admin");
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
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const closeAssignModal = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("admin_id");
        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");

        router.get(route("stationmanagement"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const openRemoveAdminModal = (admin) => {
        const params = new URLSearchParams(window.location.search);

        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");
        params.set("modal", "remove-station-admin");
        params.set("admin_id", admin.id);

        router.get(route("stationmanagement"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const closeRemoveAdminModal = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("admin_id");
        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");

        router.get(route("stationmanagement"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const loadAdminRows = (overrides = {}) => {
        const params = new URLSearchParams(window.location.search);

        params.set("admin_page", overrides.admin_page || activePage);
        params.set("admin_limit", overrides.admin_limit || adminLimit);

        if (Object.prototype.hasOwnProperty.call(overrides, "search")) {
            if (overrides.search && overrides.search.trim()) {
                params.set("search", overrides.search.trim());
            } else {
                params.delete("search");
            }
        } else if (searchTerm.trim()) {
            params.set("search", searchTerm.trim());
        }

        axios
            .get(route("stationadmin.list"), {
                params: Object.fromEntries(params),
            })
            .then((response) => {
                setStationRowsData(response.data.stationAdminRows);
                setSearchTerm(response.data.search || "");

                const nextParams = new URLSearchParams(window.location.search);
                nextParams.set("admin_page", response.data.adminPage || 1);
                nextParams.set(
                    "admin_limit",
                    response.data.adminLimit || adminLimit,
                );

                if (response.data.search) {
                    nextParams.set("search", response.data.search);
                } else {
                    nextParams.delete("search");
                }

                window.history.replaceState(
                    {},
                    "",
                    `${route("stationmanagement")}?${nextParams.toString()}`,
                );
            })
            .catch((error) => {
                console.error("Failed to load station admin rows:", error);
            });
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;

        loadAdminRows({ admin_page: page });
    };

    const submitSearch = (value) => {
        loadAdminRows({
            admin_page: 1,
            search: value?.trim() || "",
        });
    };

    const selectSuggestion = (suggestion) => {
        const nextValue = suggestion.search || suggestion.label || "";
        setSearchTerm(nextValue);
        setShowSuggestions(false);
        submitSearch(nextValue);
    };

    return {
        activePage,
        animatedStationId,
        closeAssignModal,
        closeRemoveAdminModal,
        endIndex,
        getEmployeeName,
        handlePageChange,
        openAssignModal,
        openRemoveAdminModal,
        pageNumbers,
        paginatedRows: visibleStationRows,
        searchBoxRef,
        searchTerm,
        selectSuggestion,
        setSearchTerm,
        setShowSuggestions,
        showSuggestions,
        startIndex,
        submitSearch,
        suggestionMatches,
        suggestionsLoading,
        totalEntries,
        totalPages,
    };
};

export default useStationAdminList;

