export const HEAD_STATUS_OPTIONS = {
    active: "Active",
    inactive: "Inactive",
};
export const DEPARTMENT_OPTIONS = {
    cid: "CID",
    sgod: "SGOD",
    hrmo: "HRMO",
    admin_unit: "ADMINISTRATIVE UNIT",
    cash_unit: "CASH UNIT",
    budget_unit: "BUDGET UNIT",
    accounting_unit: "ACCOUNTING UNIT",
    records_unit: "RECORDS UNIT",
    sds_office: "SDS OFFICE",
    ict_unit: "ICT UNIT",
    supply_unit: "SUPPLY UNIT",
};

export const normalizeDepartment = (dept) => {
    const map = {
        "ADMINISTRATIVE UNIT": "admin_unit",
        "ACCOUNTING UNIT": "accounting_unit",
        "BUDGET UNIT": "budget_unit",
        "CASH UNIT": "cash_unit",
        "RECORDS UNIT": "records_unit",
        "ICT UNIT": "ict_unit",
        "SUPPLY UNIT": "supply_unit",
        HRMO: "hrmo",
        CID: "cid",
        SGOD: "sgod",
        "SDS OFFICE": "sds_office",
    };

    return map[dept] || "";
};

export const POSITION_CATEGORY_OPTIONS = {
    Teaching: "Teaching",
    "Non-Teaching": "Non-Teaching",
};

export const POSITION_LEVEL_OPTIONS = {
    School: "School",
    Division: "Division",
    Regional: "Regional",
};
