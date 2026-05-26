import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { EMPLOYEES_PER_PAGE } from "../utils";
import {
    sortAlphabetically,
    sortEmployeesAlphabetically,
} from "@/lib/utils";

const defaultEmployeePagination = {
    current_page: 1,
    last_page: 1,
    per_page: EMPLOYEES_PER_PAGE,
    total: 0,
    from: null,
    to: null,
};

const useDepartmentPrintData = ({
    initialDepartmentName,
    open,
    selectedMonth,
    selectedYear,
}) => {
    const [departmentSearch, setDepartmentSearch] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState(
        initialDepartmentName,
    );
    const [departments, setDepartments] = useState([]);
    const [printEmployees, setPrintEmployees] = useState([]);
    const [employeeData, setEmployeeData] = useState({});
    const [departmentSignatories, setDepartmentSignatories] = useState({});
    const [departmentsLoading, setDepartmentsLoading] = useState(false);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [employeePage, setEmployeePage] = useState(1);
    const [employeePagination, setEmployeePagination] = useState(
        defaultEmployeePagination,
    );
    const requestRef = useRef(0);
    const lastDepartmentSearchRef = useRef(null);

    const totalEmployeePages = employeePagination.last_page || 1;
    const employeePageNumbers = Array.from(
        { length: totalEmployeePages },
        (_, index) => index + 1,
    );

    useEffect(() => {
        if (!open) return;

        setSelectedDepartment(initialDepartmentName || "");
    }, [initialDepartmentName, open]);

    useEffect(() => {
        if (!open) return;

        const requestId = requestRef.current + 1;
        const currentSearch = departmentSearch.trim();
        const shouldReloadDepartments =
            lastDepartmentSearchRef.current !== currentSearch ||
            departments.length === 0;

        requestRef.current = requestId;
        lastDepartmentSearchRef.current = currentSearch;
        setDepartmentsLoading(shouldReloadDepartments);
        setEmployeesLoading(true);

        const timeout = setTimeout(() => {
            axios
                .get(route("dailytimerecord.offices"), {
                    params: {
                        search: currentSearch,
                        department: selectedDepartment,
                        month: selectedMonth,
                        year: selectedYear,
                        employee_page: employeePage,
                    },
                })
                .then((response) => {
                    if (requestRef.current !== requestId) return;

                    const data = response.data || {};
                    const nextDepartment = data.selected_department || "";

                    if (shouldReloadDepartments) {
                        setDepartments(
                            sortAlphabetically(data.departments || [], "name"),
                        );
                    }

                    const employees = sortEmployeesAlphabetically(
                        data.employees || [],
                    );
                    setPrintEmployees(employees);
                    setEmployeePagination(
                        data.employee_pagination || defaultEmployeePagination,
                    );
                    setSelectedDepartment(nextDepartment);

                    setEmployeeData((current) => {
                        const next = { ...current };

                        employees.forEach((employee) => {
                            if (employee.details) {
                                next[employee.id] = employee.details;
                            }
                        });

                        return next;
                    });

                    const firstEmployeeWithDetails = employees.find(
                        (employee) => employee.details?.signatories,
                    );

                    if (firstEmployeeWithDetails?.details?.signatories) {
                        setDepartmentSignatories((current) => ({
                            ...current,
                            [nextDepartment]:
                                firstEmployeeWithDetails.details.signatories,
                        }));
                    }

                    const params = new URLSearchParams(window.location.search);
                    params.set("modal", "print-department");
                    if (nextDepartment) {
                        params.set("name", nextDepartment);
                    } else {
                        params.delete("name");
                    }
                    window.history.replaceState(
                        {},
                        "",
                        `${route("dailytimerecord")}?${params.toString()}`,
                    );
                })
                .catch(() => {
                    if (requestRef.current !== requestId) return;

                    if (shouldReloadDepartments) {
                        setDepartments([]);
                    }

                    setPrintEmployees([]);
                    setEmployeePagination(defaultEmployeePagination);
                })
                .finally(() => {
                    if (requestRef.current !== requestId) return;

                    if (shouldReloadDepartments) {
                        setDepartmentsLoading(false);
                    }

                    setEmployeesLoading(false);
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [
        departmentSearch,
        open,
        selectedDepartment,
        selectedMonth,
        selectedYear,
        employeePage,
    ]);

    const handleDepartmentSearchChange = (event) => {
        setDepartmentSearch(event.target.value);
        setDepartmentsLoading(true);
        setEmployeesLoading(true);
        setEmployeePage(1);
    };

    const handleDepartmentSelect = (departmentName) => {
        setSelectedDepartment(departmentName);
        setEmployeePage(1);
    };

    const handleEmployeePageChange = (page) => {
        if (page < 1 || page > totalEmployeePages) return;

        setEmployeePage(page);
    };

    return {
        departmentSearch,
        departmentSignatories,
        departments,
        departmentsLoading,
        employeeData,
        employeePage,
        employeePageNumbers,
        employeePagination,
        employeesLoading,
        handleDepartmentSearchChange,
        handleDepartmentSelect,
        handleEmployeePageChange,
        printEmployees,
        selectedDepartment,
        totalEmployeePages,
    };
};

export default useDepartmentPrintData;

