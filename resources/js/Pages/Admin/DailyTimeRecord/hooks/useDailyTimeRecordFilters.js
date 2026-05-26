import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { formatSearchDisplay } from "../utils";

const useDailyTimeRecordFilters = ({
    currentMonth,
    currentYear,
    limit,
    office,
    offices,
    search,
}) => {
    const [searchInput, setSearchInput] = useState(
        formatSearchDisplay(search),
    );
    const [selectedOffice, setSelectedOffice] = useState(office || "all");
    const [selectedMonth, setSelectedMonth] = useState(Number(currentMonth));
    const [selectedYear, setSelectedYear] = useState(String(currentYear));

    useEffect(() => {
        setSearchInput(formatSearchDisplay(search));
        const matchedOffice = offices.find((item) => item.name === office);

        setSelectedOffice(
            office === "all" ? "all" : matchedOffice?.id || "all",
        );
        setSelectedMonth(Number(currentMonth));
        setSelectedYear(String(currentYear));
    }, [search, office, offices, currentMonth, currentYear]);

    const applyFilters = ({
        searchValue = searchInput,
        officeValue = selectedOffice,
        monthValue = selectedMonth,
        yearValue = selectedYear,
        pageValue,
        limitValue = limit,
    } = {}) => {
        const query = {
            limit: limitValue,
            month: monthValue,
            year: yearValue,
        };

        if (searchValue && searchValue.trim()) {
            query.search = searchValue.trim();
        }

        const matchedOffice = offices.find(
            (item) => Number(item.id) === Number(officeValue),
        );

        if (matchedOffice) {
            query.office = matchedOffice.name;
        }

        if (pageValue && pageValue > 1) {
            query.page = pageValue;
        }

        router.get(route("dailytimerecord"), query, {
            only: ["time_record", "search", "office", "month", "year", "limit"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        applyFilters,
        searchInput,
        selectedMonth,
        selectedOffice,
        selectedYear,
        setSearchInput,
        setSelectedMonth,
        setSelectedOffice,
        setSelectedYear,
    };
};

export default useDailyTimeRecordFilters;
