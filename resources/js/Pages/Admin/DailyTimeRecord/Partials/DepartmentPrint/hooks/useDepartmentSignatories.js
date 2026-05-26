import { useEffect, useState } from "react";
import {
    employeeSignatory,
    SIGNATORY_POPOVER_WIDTH,
    signatoryChoices,
    signatoryKey,
} from "../utils";

const useDepartmentSignatories = ({
    departmentSignatories,
    dialogContentRef,
    employeeData,
    open,
    printEmployees,
    selectedDepartment,
}) => {
    const [employeeSignatoryTypes, setEmployeeSignatoryTypes] = useState({});
    const [signatoryEmployee, setSignatoryEmployee] = useState(null);
    const [signatoryPopoverPosition, setSignatoryPopoverPosition] =
        useState(null);

    const currentDepartmentSignatories =
        departmentSignatories[selectedDepartment] || null;
    const departmentSignatoryEmployee = printEmployees.find(
        (employee) => employeeData[employee.id]?.signatory,
    );
    const officeHeadSignatory =
        currentDepartmentSignatories?.office_head ||
        (departmentSignatoryEmployee
            ? employeeSignatory(
                  departmentSignatoryEmployee,
                  employeeData,
                  "office_head",
              )
            : null);
    const divisionHeadSignatory =
        currentDepartmentSignatories?.division_head ||
        (departmentSignatoryEmployee
            ? employeeSignatory(
                  departmentSignatoryEmployee,
                  employeeData,
                  "division_head",
              )
            : null);
    const isLoadingEmployeeData = printEmployees.some(
        (employee) => !employeeData[employee.id],
    );

    useEffect(() => {
        if (open) return;

        closeSignatoryPopover();
    }, [open]);

    const selectedEmployeeSignatoryType = (employee) =>
        employeeSignatoryTypes[employee.id] ||
        employeeData[employee.id]?.signatory?.type ||
        "office_head";

    const selectedEmployeeSignatory = (employee) => {
        const type = selectedEmployeeSignatoryType(employee);

        return (
            employeeData[employee.id]?.signatories?.[type] ||
            employeeData[employee.id]?.signatory
        );
    };

    const employeeSignatoryOptions = (employee) => {
        const defaultType = employeeData[employee.id]?.signatory?.type;

        return signatoryChoices
            .map((choice) => ({
                choice,
                signatory:
                    employeeData[employee.id]?.signatories?.[choice.value] ||
                    employeeSignatory(employee, employeeData, choice.value),
            }))
            .filter((item, index, items) => {
                const key = signatoryKey(item.signatory);
                const defaultIndex = items.findIndex(
                    (other) =>
                        signatoryKey(other.signatory) === key &&
                        other.choice.value === defaultType,
                );
                const firstIndex =
                    defaultIndex >= 0
                        ? defaultIndex
                        : items.findIndex(
                              (other) => signatoryKey(other.signatory) === key,
                          );

                return index === firstIndex;
            });
    };

    function closeSignatoryPopover() {
        setSignatoryEmployee(null);
        setSignatoryPopoverPosition(null);
    }

    const chooseEmployeeSignatory = (employee, type) => {
        setEmployeeSignatoryTypes((current) => ({
            ...current,
            [employee.id]: type,
        }));
        closeSignatoryPopover();
    };

    const openSignatoryPopover = (event, employee) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const content = dialogContentRef.current;
        const contentRect = content?.getBoundingClientRect();

        if (!content || !contentRect) return;

        setSignatoryPopoverPosition({
            top:
                rect.top -
                contentRect.top +
                content.scrollTop +
                rect.height / 2,
            left: Math.max(
                12,
                rect.left -
                    contentRect.left +
                    content.scrollLeft -
                    SIGNATORY_POPOVER_WIDTH -
                    12,
            ),
        });
        setSignatoryEmployee(employee);
    };

    return {
        chooseEmployeeSignatory,
        closeSignatoryPopover,
        currentDepartmentSignatories,
        divisionHeadSignatory,
        employeeSignatoryOptions,
        isLoadingEmployeeData,
        officeHeadSignatory,
        openSignatoryPopover,
        selectedEmployeeSignatory,
        selectedEmployeeSignatoryType,
        signatoryEmployee,
        signatoryPopoverPosition,
    };
};

export default useDepartmentSignatories;
