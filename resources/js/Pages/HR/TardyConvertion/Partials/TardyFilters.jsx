import React from "react";
import { CustomDropdownCheckbox } from "@/components/dropdown-menu-main";

export const TardyFilters = ({
    departments,
    selectedDepartment,
    setSelectedDepartment,
    monthList,
    selectedFirstMonth,
    setSelectedFirstMonth,
    selectedSecondMonth,
    setSelectedSecondMonth,
}) => {
    return (
        <div className="flex justify-between items-center mb-4 gap-5">
            <CustomDropdownCheckbox
                label="Department"
                items={departments}
                selected={selectedDepartment}
                onChange={setSelectedDepartment}
                buttonVariant="green"
            />
            <div className="flex items-center gap-3 w-fit">
                <span className="text-sm font-semibold">Date Range:</span>
                <CustomDropdownCheckbox
                    label="Start Month"
                    items={monthList}
                    selected={selectedFirstMonth}
                    onChange={setSelectedFirstMonth}
                    buttonVariant="cyan"
                />
                <span className="text-sm font-semibold text-gray-500">–</span>
                <CustomDropdownCheckbox
                    label="End Month"
                    items={monthList.filter(
                        (month) =>
                            new Date(month) >= new Date(selectedFirstMonth)
                    )}
                    selected={selectedSecondMonth}
                    onChange={setSelectedSecondMonth}
                    buttonVariant="indigo"
                />
            </div>
        </div>
    );
};

