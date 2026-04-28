import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

import { ClipboardX } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { Pagination } from "./ui/pagination";

const DynamicTable = ({
    passedData,
    allColumns,
    columnRenderers,
    children,
    queryParams = null,
    showTotal = false,
    visibleColumns = [],
    tableHeight = null,
}) => {
    const contentRef = useRef();
    const reactToPrintFn = useReactToPrint({
        content: () => contentRef.current,
    });
    const { props } = usePage();
    const userRole = props?.auth?.user?.role;

    const cleanData = Array.isArray(passedData?.data)
        ? passedData.data
        : passedData || [];

    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    const effectiveVisibleColumns =
        visibleColumns !== undefined && visibleColumns !== null
            ? visibleColumns
            : allColumns.map((col) => col.key);

    const handleSort = (columnKey) => {
        if (sortBy === columnKey) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortBy(columnKey);
            setSortDirection("asc");
        }
    };

    const sortedData = [...cleanData].sort((a, b) => {
        if (!sortBy) return 0;

        const aVal = a[sortBy] ?? "";
        const bVal = b[sortBy] ?? "";

        if (typeof aVal === "number" && typeof bVal === "number") {
            return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        return sortDirection === "asc"
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    });

    return (
        <>
            <div className="mb-2">{children}</div>

            {/* Table */}
            <div className="w-full overflow-x-auto border rounded-lg">
                <div
                    className={`overflow-y-auto ${
                        tableHeight ? `max-h-[${tableHeight}]` : "max-h-[800px]"
                    }`}
                >
                    <table
                        ref={contentRef}
                        className="table-auto w-full min-w-max"
                    >
                        <thead className="sticky top-0 z-5 bg-white shadow-md">
                            <tr>
                                {allColumns.map(
                                    (col) =>
                                        effectiveVisibleColumns.includes(
                                            col.key,
                                        ) && (
                                            <th
                                                key={col.key}
                                                className="bg-gray-100 text-gray-800 p-3 whitespace-nowrap text-wrap text-start text-sm font-semibold min-w-[60px] max-w-[100px]"
                                            >
                                                {col.label}
                                            </th>
                                        ),
                                )}
                            </tr>
                        </thead>
                        {/* <tbody>
                            {cleanData.length > 0 ? (
                                sortedData.map((data, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        {allColumns.map((col) =>
                                            effectiveVisibleColumns.includes(
                                                col.key
                                            ) ? (
                                                <td
                                                    key={`${rowIndex}-${col.key}`}
                                                    className="py-2 px-3 whitespace-wrap text-wrap break-words text-sm text-gray-700 min-w-[60px] max-w-[100px]"
                                                >
                                                    {columnRenderers[col.key]?.(
                                                        data
                                                    ) ?? ""}
                                                </td>
                                            ) : null
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={effectiveVisibleColumns.length}
                                        className="text-center py-6 text-gray-500"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <ClipboardX className="w-20 h-20 text-gray-400" />
                                            <span className="text-md font-medium">
                                                No records found
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody> */}

                        <tbody>
                            {cleanData.length > 0 ? (
                                sortedData.map((data, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        {allColumns.map((col) =>
                                            effectiveVisibleColumns.includes(
                                                col.key,
                                            ) ? (
                                                <td
                                                    key={`${rowIndex}-${col.key}`}
                                                    className="py-2 px-3 whitespace-wrap text-wrap break-words text-sm text-gray-700 min-w-[60px] max-w-[100px]"
                                                >
                                                    {col.key === "actions"
                                                        ? (() => {
                                                              // Render the original action column
                                                              const rendered =
                                                                  columnRenderers[
                                                                      col.key
                                                                  ]?.(data);
                                                              if (!rendered)
                                                                  return null;

                                                              // Roles allowed to see the Delete button
                                                              const allowedRoles =
                                                                  [
                                                                      "admin",
                                                                      "super_admin",
                                                                      "cdrrmo_admin",
                                                                      "resident",
                                                                  ];

                                                              // If user role is NOT allowed, filter out the Delete action
                                                              if (
                                                                  !allowedRoles.includes(
                                                                      userRole,
                                                                  ) &&
                                                                  rendered.props
                                                                      ?.actions
                                                              ) {
                                                                  const filteredActions =
                                                                      rendered.props.actions.filter(
                                                                          (a) =>
                                                                              a.label !==
                                                                              "Delete",
                                                                      );
                                                                  return React.cloneElement(
                                                                      rendered,
                                                                      {
                                                                          actions:
                                                                              filteredActions,
                                                                      },
                                                                  );
                                                              }

                                                              return rendered;
                                                          })()
                                                        : (columnRenderers[
                                                              col.key
                                                          ]?.(data) ?? "")}
                                                </td>
                                            ) : null,
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={effectiveVisibleColumns.length}
                                        className="text-center py-6 text-gray-500"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <ClipboardX className="w-20 h-20 text-gray-400" />
                                            <span className="text-md font-medium">
                                                No records found
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {effectiveVisibleColumns.length === 0 ? (
                    <div className="p-2 text-sm text-red-600 font-medium w-full text-center rounded-lg border border-gray-200 mt-4">
                        All columns are hidden.
                    </div>
                ) : (
                    <div className="my-2 px-4 flex items-center justify-between">
                        {showTotal && (
                            <span className="text-sm text-gray-700 bg-gray-100 px-2 mt-4 py-1 rounded-md">
                                Showing {cleanData.length} /{" "}
                                {passedData?.total ?? cleanData.length} records
                            </span>
                        )}

                        {Array.isArray(passedData?.links) &&
                            passedData.links.length > 0 && (
                                <Pagination
                                    links={passedData.links}
                                    queryParams={queryParams}
                                />
                            )}
                    </div>
                )}
            </div>
        </>
    );
};

export default DynamicTable;
