export const ITEMS_PER_PAGE = 6;
export const HEAD_ITEMS_PER_PAGE = 10;

export const getFullName = (employee) => {
    if (!employee) return "-";

    return `${employee.first_name || ""} ${employee.middle_name || ""} ${
        employee.last_name || ""
    }`
        .replace(/\s+/g, " ")
        .trim();
};

export const getOfficeHeadKey = (office) => {
    if (!office) return null;

    return String(office.id);
};

export const paginateItems = (items, page, perPage = ITEMS_PER_PAGE) =>
    items.slice((page - 1) * perPage, page * perPage);

export const getTotalPages = (items, perPage = ITEMS_PER_PAGE) =>
    Math.max(Math.ceil(items.length / perPage), 1);

export const blueBlackPalette = [
    "#0f172a",
    "#1d4ed8",
    "#2563eb",
    "#475569",
    "#93c5fd",
];

export const closeDepartmentModalParams = (query) => {
    query.delete("modal");
    query.delete("head_id");
    query.delete("division_id");
    query.delete("division_name");
    query.delete("office_id");
};
