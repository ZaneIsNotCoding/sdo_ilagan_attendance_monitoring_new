import React, { useState } from "react";
import { CustomDropdownCheckbox } from "./dropdown-menu-main";
import { router } from "@inertiajs/react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    HEAD_STATUS_OPTIONS,
    DEPARTMENT_OPTIONS,
    POSITION_CATEGORY_OPTIONS,
    POSITION_LEVEL_OPTIONS,
} from "@/constants";

const FilterToggle = ({ queryParams, visibleFilters = [], url }) => {
    const isVisible = (key) => visibleFilters.includes(key);

    const statusOptions = ["active", "inactive"];

    const searchFieldName = (field, value) => {
        const params = { ...queryParams };

        if (value && value !== "All" && value.trim() !== "") {
            params[field] = value;
        } else {
            delete params[field];
        }

        delete params.page;

        router.get(route(url), params, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <div className="flex gap-2 items-center mb-0 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 px-1">
            {isVisible("status") && (
                <Select
                    onValueChange={(v) => searchFieldName("status", v)}
                    value={queryParams.status ?? ""}
                >
                    <SelectTrigger className="w-[95px] flex items-center">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {Object.entries(HEAD_STATUS_OPTIONS).map(
                            ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ),
                        )}
                    </SelectContent>
                </Select>
            )}

            {isVisible("department") && (
                <Select
                    onValueChange={(v) => searchFieldName("department", v)}
                    value={queryParams.department ?? ""}
                >
                    <SelectTrigger className="w-[140px] flex items-center">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {Object.entries(DEPARTMENT_OPTIONS).map(
                            ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ),
                        )}
                    </SelectContent>
                </Select>
            )}
            {isVisible("category") && (
                <Select
                    onValueChange={(v) => searchFieldName("category", v)}
                    value={queryParams.category ?? "All"}
                >
                    <SelectTrigger className="w-[150px] flex items-center">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {Object.entries(POSITION_CATEGORY_OPTIONS).map(
                            ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ),
                        )}
                    </SelectContent>
                </Select>
            )}

            {isVisible("level") && (
                <Select
                    onValueChange={(v) => searchFieldName("level", v)}
                    value={queryParams.level ?? "All"}
                >
                    <SelectTrigger className="w-[130px] flex items-center">
                        <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {Object.entries(POSITION_LEVEL_OPTIONS).map(
                            ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ),
                        )}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
};

export default FilterToggle;
