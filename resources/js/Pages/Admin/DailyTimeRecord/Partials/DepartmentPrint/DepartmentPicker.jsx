import React from "react";
import { Building2, Check, Search, Users } from "lucide-react";
import FloatingInput from "@/components/floating-input";
import { DepartmentSkeletonList } from "@/Components/Skeletons";

const DepartmentPicker = ({
    departmentSearch,
    departments,
    departmentsLoading,
    selectedDepartment,
    onSearchChange,
    onSelectDepartment,
}) => (
    <div className="space-y-3">
        <FloatingInput
            label="Search department"
            icon={Search}
            name="department_search"
            value={departmentSearch}
            onChange={onSearchChange}
        />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Users className="h-4 w-4 text-blue-600" />
                    Department List
                </div>
                <div className="text-xs text-slate-400">
                    {departmentsLoading
                        ? "Searching..."
                        : `Showing ${departments.length ? 1 : 0} to ${
                              departments.length
                          }`}
                </div>
            </div>

            <div className="h-[25.5rem] space-y-2 overflow-y-auto p-2">
                {departmentsLoading ? (
                    <DepartmentSkeletonList />
                ) : departments.length ? (
                    departments.map((department) => {
                        const isSelected =
                            selectedDepartment === department.name;

                        return (
                            <button
                                key={department.id}
                                type="button"
                                onClick={() =>
                                    onSelectDepartment(department.name)
                                }
                                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                                    isSelected
                                        ? "border-blue-500 bg-blue-50 text-blue-900"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50"
                                }`}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">
                                            {department.name}
                                        </div>
                                        <div className="truncate text-xs text-slate-500">
                                            {department.division?.name ||
                                                department.division?.code ||
                                                "-"}
                                        </div>
                                    </div>
                                </div>

                                {isSelected ? (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                                        <Check className="h-3 w-3 text-white" />
                                    </span>
                                ) : null}
                            </button>
                        );
                    })
                ) : (
                    <div className="py-6 text-center text-sm text-slate-500">
                        No departments found.
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default DepartmentPicker;
