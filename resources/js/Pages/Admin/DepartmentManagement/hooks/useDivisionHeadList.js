import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import {
    closeDepartmentModalParams,
    HEAD_ITEMS_PER_PAGE,
} from "../utils";
import { getEmployeeName } from "@/lib/utils";

const useDivisionHeadList = ({
    division_heads,
    divisions,
    highlightedDivisionId,
    highlightRequestKey,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [animatedDivisionId, setAnimatedDivisionId] = useState(null);
    const animationTimeoutRef = useRef(null);
    const visibleDivisionRows = useMemo(
        () =>
            divisions.map((division) => {
                const head =
                    division_heads.find((item) => item.division_id === division.id) ||
                    null;
                return { division, head };
            }),
        [division_heads, divisions],
    );
    const highlightedDivisionIndex = useMemo(
        () =>
            visibleDivisionRows.findIndex(
                (row) => row.division.id === highlightedDivisionId,
            ),
        [visibleDivisionRows, highlightedDivisionId],
    );
    const totalPages =
        Math.ceil(visibleDivisionRows.length / HEAD_ITEMS_PER_PAGE) || 1;
    const paginatedRows = visibleDivisionRows.slice(
        (currentPage - 1) * HEAD_ITEMS_PER_PAGE,
        currentPage * HEAD_ITEMS_PER_PAGE,
    );
    const startIndex =
        visibleDivisionRows.length === 0
            ? 0
            : (currentPage - 1) * HEAD_ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(
        currentPage * HEAD_ITEMS_PER_PAGE,
        visibleDivisionRows.length,
    );

    useEffect(() => {
        if (highlightedDivisionId == null || highlightedDivisionIndex < 0) {
            return;
        }

        setCurrentPage(
            Math.floor(highlightedDivisionIndex / HEAD_ITEMS_PER_PAGE) + 1,
        );
        setAnimatedDivisionId(highlightedDivisionId);

        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        animationTimeoutRef.current = setTimeout(() => {
            setAnimatedDivisionId(null);
        }, 2200);
    }, [highlightedDivisionId, highlightedDivisionIndex, highlightRequestKey]);

    useEffect(
        () => () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        },
        [],
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [divisions]);

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
        animatedDivisionId,
        closeDepartmentModal,
        currentPage,
        endIndex,
        getEmployeeName,
        openDepartmentModal,
        paginatedRows,
        setCurrentPage,
        startIndex,
        totalPages,
        visibleDivisionRows,
    };
};

export default useDivisionHeadList;

