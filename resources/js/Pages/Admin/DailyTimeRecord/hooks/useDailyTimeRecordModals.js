import { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";

const clearDtrModalParams = (params) => {
    params.delete("modal");
    params.delete("employee_id");
    params.delete("name");
};

const employeeDisplayName = (employee) =>
    employee?.full_name || employee?.first_name || "";

const useDailyTimeRecordModals = ({
    departmentPrintModal,
    printDtrModal,
}) => {
    const [selectedEmployees, setSelectedEmployees] = useState({});
    const [dialogOpen, setDialogOpen] = useState(Boolean(printDtrModal));
    const [printEmployees, setPrintEmployees] = useState(
        printDtrModal?.employee ? [printDtrModal.employee] : [],
    );
    const [departmentDialogOpen, setDepartmentDialogOpen] = useState(
        Boolean(departmentPrintModal),
    );
    const initialPrintEmployeeData = useMemo(
        () =>
            printDtrModal?.employee && printDtrModal?.details
                ? {
                      [printDtrModal.employee.id]: printDtrModal.details,
                  }
                : {},
        [printDtrModal],
    );

    useEffect(() => {
        setDialogOpen(Boolean(printDtrModal));
        setPrintEmployees(
            printDtrModal?.employee ? [printDtrModal.employee] : [],
        );
    }, [printDtrModal]);

    useEffect(() => {
        setDepartmentDialogOpen(Boolean(departmentPrintModal));
    }, [departmentPrintModal]);

    const handlePreviewEmployee = (employee) => {
        const params = new URLSearchParams(window.location.search);

        params.set("modal", "preview-dtr");
        params.set("employee_id", employee.id);
        params.set("name", employeeDisplayName(employee));

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const openPrintDialog = (nextEmployees) => {
        const nextSelection = {};
        const firstEmployee = nextEmployees[0];

        nextEmployees.forEach((emp) => {
            nextSelection[emp.id] = true;
        });

        setSelectedEmployees(nextSelection);
        setPrintEmployees(nextEmployees);
        setDialogOpen(true);

        if (!firstEmployee) {
            return;
        }

        const params = new URLSearchParams(window.location.search);

        params.set("modal", "print-dtr");
        params.set("employee_id", firstEmployee.id);
        params.set("name", employeeDisplayName(firstEmployee));

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            only: ["printDtrModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closePrintDialog = () => {
        const params = new URLSearchParams(window.location.search);

        clearDtrModalParams(params);
        setDialogOpen(false);
        setPrintEmployees([]);

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            only: ["printDtrModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closePreviewDtr = () => {
        const params = new URLSearchParams(window.location.search);

        clearDtrModalParams(params);

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const openDepartmentPrintDialog = () => {
        const params = new URLSearchParams(window.location.search);

        params.set("modal", "print-department");
        setDepartmentDialogOpen(true);

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            only: ["departmentPrintModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeDepartmentPrintDialog = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("name");
        setDepartmentDialogOpen(false);

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            only: ["departmentPrintModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        closeDepartmentPrintDialog,
        closePreviewDtr,
        closePrintDialog,
        departmentDialogOpen,
        handlePreviewEmployee,
        initialPrintEmployeeData,
        openDepartmentPrintDialog,
        openPrintDialog,
        printEmployees,
        selectedEmployees,
        setSelectedEmployees,
        dialogOpen,
    };
};

export default useDailyTimeRecordModals;
