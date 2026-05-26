import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import {
    closeDepartmentModalParams,
    HEAD_ITEMS_PER_PAGE,
} from "../utils";
import { getEmployeeName, sortAlphabetically } from "@/lib/utils";

const getOfficeSearchText = (office) =>
    [
        office?.id,
        office?.name,
        office?.division?.id,
        office?.division?.code,
        office?.division?.name,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

const useDepartmentHeadList = ({
    highlightedOfficeId,
    highlightRequestKey,
    office_heads,
    officeSearch,
    offices,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState(officeSearch);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [animatedOfficeId, setAnimatedOfficeId] = useState(null);
    const animationTimeoutRef = useRef(null);
    const rows = useMemo(() => {
        return sortAlphabetically(offices, "name")
            .map((office) => ({
                office,
                head:
                    office_heads.find(
                        (head) =>
                            String(head.employee?.office_id) ===
                            String(office.id),
                    ) || null,
            }));
    }, [offices, office_heads]);
    const visibleRows = useMemo(() => {
        const query = officeSearch.trim().toLowerCase();

        if (!query) return rows;

        return rows.filter((row) =>
            getOfficeSearchText(row.office).includes(query),
        );
    }, [rows, officeSearch]);
    const totalPages = Math.ceil(visibleRows.length / HEAD_ITEMS_PER_PAGE);
    const highlightedOfficeIndex = useMemo(
        () =>
            visibleRows.findIndex(
                (row) => String(row.office.id) === String(highlightedOfficeId),
            ),
        [highlightedOfficeId, visibleRows],
    );
    const paginatedRows = visibleRows.slice(
        (currentPage - 1) * HEAD_ITEMS_PER_PAGE,
        currentPage * HEAD_ITEMS_PER_PAGE,
    );
    const totalEntries = visibleRows.length;
    const startIndex =
        totalEntries === 0 ? 0 : (currentPage - 1) * HEAD_ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * HEAD_ITEMS_PER_PAGE, totalEntries);
    const suggestions = useMemo(() => {
        const query = searchInput.trim().toLowerCase();
        if (!query) return [];

        const seen = new Set();
        const results = [];

        const pushSuggestion = (officeId, officeName, divisionName, value) => {
            const key =
                `${officeId}__${officeName}__${divisionName}__${value}`.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            results.push({ officeId, officeName, divisionName, value });
        };

        offices.forEach((office) => {
            const division = office.division;
            const haystack = getOfficeSearchText(office);

            if (haystack.includes(query)) {
                pushSuggestion(
                    office.id,
                    office.name,
                    division?.name || division?.code || "",
                    office.name,
                );
            }
        });

        return sortAlphabetically(results, "officeName").slice(0, 6);
    }, [offices, searchInput]);

    useEffect(() => {
        setSearchInput(officeSearch || "");
    }, [officeSearch]);

    useEffect(() => {
        if (highlightedOfficeId == null || highlightedOfficeIndex < 0) {
            return;
        }

        setCurrentPage(
            Math.floor(highlightedOfficeIndex / HEAD_ITEMS_PER_PAGE) + 1,
        );
        setAnimatedOfficeId(highlightedOfficeId);

        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        animationTimeoutRef.current = setTimeout(() => {
            setAnimatedOfficeId(null);
        }, 2200);
    }, [highlightedOfficeId, highlightedOfficeIndex, highlightRequestKey]);

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [officeSearch]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const runSearch = (value) => {
        setCurrentPage(1);

        router.get(
            route("departmentmanagement"),
            value.trim() ? { office_search: value.trim() } : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleSearch = (event) => {
        event.preventDefault();
        runSearch(searchInput);
    };

    const openDepartmentModal = (modal, params = {}) => {
        const query = new URLSearchParams(window.location.search);

        query.delete("head_id");
        query.delete("division_id");
        query.delete("division_name");
        query.delete("office_id");
        query.set("modal", modal);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                query.set(key, value);
            }
        });

        router.get(route("departmentmanagement"), Object.fromEntries(query), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeDepartmentModal = () => {
        const query = new URLSearchParams(window.location.search);
        closeDepartmentModalParams(query);

        router.get(route("departmentmanagement"), Object.fromEntries(query), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        animatedOfficeId,
        closeDepartmentModal,
        currentPage,
        endIndex,
        getEmployeeName,
        handlePageChange,
        handleSearch,
        isSearchFocused,
        openDepartmentModal,
        paginatedRows,
        runSearch,
        searchInput,
        setIsSearchFocused,
        setSearchInput,
        startIndex,
        suggestions,
        totalEntries,
        totalPages,
    };
};

export default useDepartmentHeadList;

