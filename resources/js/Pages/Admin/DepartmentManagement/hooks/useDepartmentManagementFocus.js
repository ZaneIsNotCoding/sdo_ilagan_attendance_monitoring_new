import { useRef, useState } from "react";

const useDepartmentManagementFocus = () => {
    const sectionRef = useRef(null);
    const [highlightedOfficeId, setHighlightedOfficeId] = useState(null);
    const [highlightRequestKey, setHighlightRequestKey] = useState(0);

    const focusOfficeRow = (officeId) => {
        if (!officeId) return;

        setHighlightedOfficeId(officeId);
        setHighlightRequestKey((value) => value + 1);

        sectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return {
        focusOfficeRow,
        highlightedOfficeId,
        highlightRequestKey,
        sectionRef,
    };
};

export default useDepartmentManagementFocus;
