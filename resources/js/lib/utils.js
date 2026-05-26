import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
});

const getPathValue = (item, path) =>
    String(path)
        .split(".")
        .reduce((value, key) => value?.[key], item);

export const compareAlphabetically = (a, b) =>
    collator.compare(String(a || ""), String(b || ""));

export const getEmployeeName = (employee) =>
    employee?.full_name ||
    employee?.name ||
    [employee?.first_name, employee?.middle_name, employee?.last_name]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

export const getRecordEmployeeName = (record) =>
    record?.employee_name || getEmployeeName(record?.employee);

export const sortAlphabetically = (items = [], selector = "name") => {
    const list = Array.isArray(items) ? items : [];

    return [...list].sort((a, b) => {
        const first =
            typeof selector === "function"
                ? selector(a)
                : getPathValue(a, selector);
        const second =
            typeof selector === "function"
                ? selector(b)
                : getPathValue(b, selector);

        return compareAlphabetically(first, second);
    });
};

export const sortEmployeesAlphabetically = (employees = []) =>
    sortAlphabetically(employees, getEmployeeName);

export const sortWithPinnedFirst = (items = [], pinnedValues = []) => {
    const pinnedSet = new Set(pinnedValues);
    const pinned = [];
    const remaining = [];

    items.forEach((item) => {
        if (pinnedSet.has(item)) {
            pinned.push(item);
        } else {
            remaining.push(item);
        }
    });

    return [...pinned, ...sortAlphabetically(remaining, (item) => item)];
};

