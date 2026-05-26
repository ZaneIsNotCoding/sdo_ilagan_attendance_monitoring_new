import { useRef, useState } from "react";
import { router } from "@inertiajs/react";

const useStationManagementFocus = ({ adminLimit }) => {
    const sectionRef = useRef(null);
    const [highlightedStationId, setHighlightedStationId] = useState(null);
    const [highlightRequestKey, setHighlightRequestKey] = useState(0);

    const focusStationRow = (stationId, adminPage = null) => {
        if (!stationId) return;

        setHighlightedStationId(stationId);
        setHighlightRequestKey((value) => value + 1);

        if (adminPage) {
            const params = new URLSearchParams(window.location.search);
            params.set("admin_page", adminPage);
            params.set("admin_limit", adminLimit);

            router.get(route("stationmanagement"), Object.fromEntries(params), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }

        sectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return {
        focusStationRow,
        highlightedStationId,
        highlightRequestKey,
        sectionRef,
    };
};

export default useStationManagementFocus;

