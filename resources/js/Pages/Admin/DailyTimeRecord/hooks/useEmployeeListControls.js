import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

export const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

export const formatWorkSchedule = (schedule) =>
    schedule?.name ||
    [schedule?.time_in, schedule?.time_out].filter(Boolean).join(" - ");

const useEmployeeListControls = ({
    applyFilters,
    offices,
    pagination,
    search,
    selectedMonth,
    selectedOffice,
    selectedYear,
    setSearch,
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const suggestionRequestRef = useRef(0);
    const searchBoxRef = useRef(null);
    const currentPage = pagination?.current_page || 1;
    const totalPages = pagination?.last_page || 1;
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    const officeItems = useMemo(
        () => [{ id: "all", name: "All Offices" }, ...offices],
        [offices],
    );
    const officeButtonLabel =
        offices.find((office) => Number(office.id) === Number(selectedOffice))
            ?.name || "All Offices";
    const selectedMonthLabel =
        monthOptions.find(
            (item) => Number(item.value) === Number(selectedMonth),
        )?.label || monthOptions[new Date().getMonth()].label;
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();

        return Array.from({ length: 7 }, (_, index) =>
            String(currentYear - 3 + index),
        ).reverse();
    }, []);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        applyFilters({ pageValue: page });
    };

    const submitSearch = (value) => {
        applyFilters({ searchValue: value });
    };

    const selectSuggestion = (suggestion) => {
        const nextValue = suggestion.search || suggestion.label || "";

        setSearch(nextValue);
        setShowSuggestions(false);
        submitSearch(`${suggestion.id} ${nextValue}`.trim());
    };

    useEffect(() => {
        const query = (search || "").trim();

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
                .get(route("dailytimerecord.suggestions"), {
                    params: { search: query },
                })
                .then((response) => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionMatches(response.data || []);
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

        return () => clearTimeout(timeout);
    }, [search]);

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

    return {
        currentPage,
        handlePageChange,
        monthOptions,
        officeButtonLabel,
        officeItems,
        pageNumbers,
        searchBoxRef,
        selectSuggestion,
        selectedMonthLabel,
        setShowSuggestions,
        showSuggestions,
        submitSearch,
        suggestionMatches,
        suggestionsLoading,
        totalPages,
        yearOptions,
    };
};

export default useEmployeeListControls;
