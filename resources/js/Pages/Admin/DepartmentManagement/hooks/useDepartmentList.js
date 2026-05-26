import { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import {
    blueBlackPalette,
    closeDepartmentModalParams,
    ITEMS_PER_PAGE,
    paginateItems,
} from "../utils";

const useDepartmentList = ({ offices, office_heads }) => {
    const [officePage, setOfficePage] = useState(1);
    const [divisionPage, setDivisionPage] = useState(1);
    const [chartReady, setChartReady] = useState(false);
    const sortedOffices = useMemo(
        () =>
            [...offices].sort((a, b) =>
                (a?.name || "").localeCompare(b?.name || ""),
            ),
        [offices],
    );
    const assignedCount = sortedOffices.filter((office) =>
        office_heads.some((head) => head.employee?.office_id === office.id),
    ).length;
    const missingOffices = sortedOffices.filter(
        (office) =>
            !office_heads.some((head) => head.employee?.office_id === office.id),
    );
    const coverage = Math.round(
        (assignedCount / (sortedOffices.length || 1)) * 100,
    );
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

        return {
            labels,
            datasets: [
                {
                    data: Object.values(grouped),
                    backgroundColor: labels.map(
                        (_, index) =>
                            blueBlackPalette[index % blueBlackPalette.length],
                    ),
                    borderWidth: 0,
                },
            ],
        };
    }, [offices]);
    const divisionSummary = useMemo(() => {
        return offices.reduce((acc, office) => {
            const key =
                office?.division?.code || office?.division?.name || "Unknown";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }, [offices]);

    useEffect(() => {
        const timer = setTimeout(() => setChartReady(true), 200);
        return () => clearTimeout(timer);
    }, []);

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
        assignedCount,
        blueBlackPalette,
        chartData,
        chartOptions,
        chartReady,
        closeDepartmentModal,
        coverage,
        divisionAnalytics,
        divisionChartOptions: chartOptions,
        divisionPage,
        divisionSummary,
        missingOffices,
        officePage,
        openDepartmentModal,
        setDivisionPage,
        setOfficePage,
        sortedOffices,
    };
};

export const useDepartmentPagination = ({
    divisionPage,
    divisions,
    officePage,
    setDivisionPage,
    setOfficePage,
    sortedOffices,
}) => {
    const sortedDivisions = useMemo(
        () =>
            [...divisions].sort((a, b) =>
                (a?.name || "").localeCompare(b?.name || ""),
            ),
        [divisions],
    );
    const totalOfficePages = Math.max(
        Math.ceil(sortedOffices.length / ITEMS_PER_PAGE),
        1,
    );
    const totalDivisionPages = Math.max(
        Math.ceil(sortedDivisions.length / ITEMS_PER_PAGE),
        1,
    );
    const paginatedOffices = paginateItems(
        sortedOffices,
        officePage,
        ITEMS_PER_PAGE,
    );
    const paginatedDivisions = paginateItems(
        sortedDivisions,
        divisionPage,
        ITEMS_PER_PAGE,
    );

    useEffect(() => {
        setOfficePage((page) => Math.min(page, totalOfficePages));
    }, [setOfficePage, totalOfficePages]);

    useEffect(() => {
        setDivisionPage((page) => Math.min(page, totalDivisionPages));
    }, [setDivisionPage, totalDivisionPages]);

    return {
        paginatedDivisions,
        paginatedOffices,
        sortedDivisions,
        totalDivisionPages,
        totalOfficePages,
    };
};

export default useDepartmentList;
