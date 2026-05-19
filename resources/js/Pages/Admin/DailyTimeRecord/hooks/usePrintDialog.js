import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";

export const signatoryChoices = [
    { value: "office_head", label: "Office Head" },
    { value: "division_head", label: "Division Head" },
];

export const employeeDepartment = (employee) =>
    employee?.department || employee?.office?.name || "No Department";

const fallbackSignatory = (employee) => ({
    name: "Loading signatory...",
    position: "Signatory",
    office: employeeDepartment(employee),
    employee: null,
    type: "office_head",
    missing: true,
});

const employeeSignatory = (employee, employeeData) =>
    employeeData[employee.id]?.signatory || fallbackSignatory(employee);

export const resolveSignatory = (employee, employeeData, signatoryType) => {
    const data = employeeData[employee.id];

    return (
        data?.signatories?.[signatoryType] ||
        employeeSignatory(employee, employeeData)
    );
};

export const signatoryKey = (signatory) =>
    signatory?.employee?.id
        ? `employee:${signatory.employee.id}`
        : [
              signatory?.label,
              signatory?.name,
              signatory?.position,
              signatory?.office,
          ].join("|");

const usePrintDialog = ({
    initialEmployeeData,
    onClose,
    open,
    selectedEmployees,
    selectedMonth,
    selectedYear,
}) => {
    const initialEmployee = selectedEmployees[0] || {};
    const [isGenerating, setIsGenerating] = useState(false);
    const [employeeData, setEmployeeData] = useState(initialEmployeeData);
    const [signatoryType, setSignatoryType] = useState(
        initialEmployeeData[initialEmployee.id]?.signatory?.type ||
            "office_head",
    );
    const pdfRefs = useRef({});
    const printEmployees = selectedEmployees;
    const firstEmployee = printEmployees[0] || {};
    const selectedEmployeeData = employeeData[firstEmployee.id];
    const defaultSignatoryType =
        employeeData[firstEmployee.id]?.signatory?.type;
    const isLoadingEmployeeData = printEmployees.some(
        (employee) => !employeeData[employee.id],
    );
    const isSignatoryLoading =
        open && firstEmployee.id && !selectedEmployeeData;
    const selectedSignatoryKey = signatoryKey(
        resolveSignatory(firstEmployee, employeeData, signatoryType),
    );
    const visibleSignatoryChoices = signatoryChoices
        .map((choice) => ({
            choice,
            signatory: resolveSignatory(
                firstEmployee,
                employeeData,
                choice.value,
            ),
        }))
        .filter((item, index, items) => {
            const key = signatoryKey(item.signatory);
            const defaultIndex = items.findIndex(
                (other) =>
                    signatoryKey(other.signatory) === key &&
                    other.choice.value === defaultSignatoryType,
            );
            const firstIndex =
                defaultIndex >= 0
                    ? defaultIndex
                    : items.findIndex(
                          (other) => signatoryKey(other.signatory) === key,
                      );

            return index === firstIndex;
        });

    useEffect(() => {
        if (!open) return;

        setEmployeeData((current) => ({
            ...current,
            ...initialEmployeeData,
        }));
    }, [open, initialEmployeeData]);

    useEffect(() => {
        if (!open) return;
        if (!["office_head", "division_head"].includes(defaultSignatoryType)) {
            return;
        }

        setSignatoryType(defaultSignatoryType);
    }, [open, defaultSignatoryType]);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);

        for (const employee of printEmployees) {
            const element = pdfRefs.current[employee.id];
            if (!element) continue;

            await new Promise((resolve) => setTimeout(resolve, 50));

            await html2pdf()
                .set({
                    margin: 0.5,
                    filename: `DTR_${(employee.full_name || "employee").replace(
                        /\s+/g,
                        "_",
                    )}_${selectedYear}-${String(selectedMonth).padStart(
                        2,
                        "0",
                    )}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: {
                        unit: "in",
                        format: "letter",
                        orientation: "portrait",
                    },
                })
                .from(element)
                .save();
        }

        setIsGenerating(false);
        onClose();
    };

    return {
        employeeData,
        firstEmployee,
        handleDownloadPDF,
        isGenerating,
        isLoadingEmployeeData,
        isSignatoryLoading,
        pdfRefs,
        printEmployees,
        selectedSignatoryKey,
        setSignatoryType,
        signatoryType,
        visibleSignatoryChoices,
    };
};

export default usePrintDialog;
