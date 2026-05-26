import React from "react";
import { Check } from "lucide-react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import {
    employeeDepartment,
    SIGNATORY_POPOVER_WIDTH,
    signatoryKey,
} from "./utils";

const SignatoryPopover = ({
    employee,
    employeeData,
    options,
    position,
    selectedEmployeeSignatory,
    selectedEmployeeSignatoryType,
    onChoose,
    onClose,
}) => {
    if (!employee || !position) return null;

    return (
        <>
            <button
                type="button"
                aria-label="Close signatory picker"
                className="absolute inset-0 z-[70] cursor-default bg-transparent"
                onClick={onClose}
            />

            <div
                className="absolute z-[80] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"
                style={{
                    top: position.top,
                    left: position.left,
                    width: SIGNATORY_POPOVER_WIDTH,
                    transform: "translateY(-50%)",
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-slate-200 bg-white" />

                <div className="mb-3 pr-2">
                    <div className="text-sm font-semibold text-slate-900">
                        Change Signatory
                    </div>
                    <div className="truncate text-xs text-slate-500">
                        {employee.full_name || "Selected employee"}
                    </div>
                </div>

                <div className="grid gap-2">
                    {options(employee).map(({ choice, signatory }) => {
                        const isSelected =
                            selectedEmployeeSignatoryType(employee) ===
                                choice.value ||
                            signatoryKey(selectedEmployeeSignatory(employee)) ===
                                signatoryKey(signatory);
                        const isDefault =
                            employeeData[employee.id]?.signatory?.type ===
                            choice.value;

                        return (
                            <button
                                key={choice.value}
                                type="button"
                                onClick={() => onChoose(employee, choice.value)}
                                className={`relative min-w-0 rounded-xl border px-3 py-2.5 text-left transition ${
                                    isSelected
                                        ? "border-blue-500 bg-blue-50 text-blue-900"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50"
                                }`}
                            >
                                {isDefault ? (
                                    <span className="absolute right-2 top-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                        Default
                                    </span>
                                ) : null}

                                <div className="flex min-w-0 items-center gap-2">
                                    <EmployeeAvatar
                                        employee={signatory.employee}
                                        name={signatory.name}
                                        className="h-9 w-9"
                                    />
                                    <div className="min-w-0 pr-3">
                                        <div className="truncate text-[10px] font-medium uppercase tracking-wide text-blue-600">
                                            {signatory.label || choice.label}
                                        </div>
                                        <div className="truncate text-sm font-semibold text-slate-900">
                                            {signatory.name}
                                        </div>
                                        <div className="truncate text-xs text-slate-500">
                                            {signatory.missing
                                                ? ""
                                                : signatory.position ||
                                                  choice.label}
                                        </div>
                                        <div className="truncate text-xs text-slate-500">
                                            {signatory.office ||
                                                employeeDepartment(employee)}
                                        </div>
                                    </div>
                                </div>

                                {isSelected ? (
                                    <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                                        <Check className="h-3 w-3 text-white" />
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default SignatoryPopover;
