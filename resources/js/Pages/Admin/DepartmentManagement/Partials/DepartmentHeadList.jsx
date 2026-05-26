import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/floating-input";
import { Building2, CheckCircle2, XCircle, Trash2, Search } from "lucide-react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import AddOfficeHeadForm from "./AddOfficeHeadForm";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import useDepartmentHeadList from "../hooks/useDepartmentHeadList";

const DepartmentHeadList = ({
    office_heads = [],
    offices = [],
    officeSearch = "",
    assignOfficeHeadModal = null,
    deleteOfficeHeadModal = null,
    highlightedOfficeId = null,
    highlightRequestKey = 0,
}) => {
    const {
        animatedOfficeId,
        closeDepartmentModal,
        currentPage,
        endIndex,
        getEmployeeName,
        handlePageChange,
        handleSearch,
        isSearchFocused,
        openDepartmentModal,
        paginatedRows,
        runSearch,
        searchInput,
        setIsSearchFocused,
        setSearchInput,
        startIndex,
        suggestions,
        totalEntries,
        totalPages,
    } = useDepartmentHeadList({
        highlightedOfficeId,
        highlightRequestKey,
        office_heads,
        officeSearch,
        offices,
    });

    return (
        <div className="rounded-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-lg font-bold">Section / Unit Head</h2>
                    <p className="text-sm text-gray-500">
                        Manage section / unit head assignments
                    </p>
                </div>

                <form
                    className="relative w-full max-w-sm"
                    onSubmit={handleSearch}
                >
                    <div className="relative">
                        <FloatingInput
                            label="Search Office"
                            icon={Search}
                            name="office-search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => {
                                window.setTimeout(() => {
                                    setIsSearchFocused(false);
                                }, 120);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    runSearch(searchInput);
                                    setIsSearchFocused(false);
                                }
                            }}
                        />

                        {isSearchFocused &&
                            searchInput.trim() &&
                            suggestions.length > 0 && (
                                <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                    <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Offices
                                    </div>

                                    <div className="max-h-72 overflow-y-auto">
                                        {suggestions.map((item) => (
                                            <button
                                                key={`${item.officeId}-${item.officeName}-${item.value}`}
                                                type="button"
                                                className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                                onClick={() => {
                                                    setSearchInput(item.value);
                                                    runSearch(item.value);
                                                    setIsSearchFocused(false);
                                                }}
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-slate-800">
                                                        {item.officeName}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {item.divisionName}
                                                    </div>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                    Search
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                </form>
            </div>

            <AddOfficeHeadForm
                open={!!assignOfficeHeadModal}
                setOpen={(nextOpen) => {
                    if (!nextOpen) closeDepartmentModal();
                }}
                offices={offices}
                preselectedOffice={assignOfficeHeadModal?.office_id || null}
            />

            <div className="overflow-x-auto border rounded-lg">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="text-white text-left px-10 w-[25%]">
                                Employee Name
                            </TableHead>
                            <TableHead className="text-white p-3 w-[20%]">
                                Position
                            </TableHead>
                            <TableHead className="text-white p-3 w-[25%]">
                                Office
                            </TableHead>
                            <TableHead className="text-white p-3 w-[10%]">
                                Status
                            </TableHead>
                            <TableHead className="text-white p-3 w-[10%]">
                                Date Assigned
                            </TableHead>
                            <TableHead className="text-white text-center p-3 w-[15%]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((row) => {
                                const emp = row.head?.employee;
                                const fullName = getEmployeeName(emp);
                                const isHighlighted =
                                    String(row.office.id) ===
                                    String(animatedOfficeId);

                                return (
                                    <TableRow
                                        key={row.office.id}
                                        className={`h-[64px] transition ${
                                            isHighlighted
                                                ? "bg-amber-50 ring-1 ring-inset ring-amber-300 hover:bg-amber-100"
                                                : !row.head
                                                  ? "bg-gray-100 hover:bg-gray-200"
                                                  : "bg-white hover:bg-blue-50"
                                        }`}
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={emp}
                                                />
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">
                                                        {emp
                                                            ? fullName
                                                            : "No Head Assigned"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="min-w-0 p-3">
                                            <span
                                                className="block max-w-full truncate"
                                                title={emp?.position || "-"}
                                            >
                                                {emp?.position || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <div className="flex items-start gap-2 min-w-0">
                                                <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                    <Building2 className="w-4 h-4 text-blue-600" />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {row.office.name}
                                                    </div>

                                                    <div className="truncate text-xs text-gray-500">
                                                        {row.office.division
                                                            ?.name || "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            {row.head ? (
                                                <span className="px-2 py-1 text-xs font-semibold bg-green-200 text-green-800 rounded-full inline-flex items-center gap-2">
                                                    <CheckCircle2 size={14} />
                                                    Assigned
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 rounded-full inline-flex items-center gap-2">
                                                    <XCircle size={14} />
                                                    Missing
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="p-3">
                                            {row.head
                                                ? new Date(
                                                      row.head.created_at,
                                                  ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                          year: "numeric",
                                                          month: "short",
                                                          day: "numeric",
                                                      },
                                                  )
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="p-3 text-center">
                                            {row.head ? (
                                                <Button
                                                    size="icon"
                                                    onClick={() =>
                                                        openDepartmentModal(
                                                            "delete-office-head",
                                                            {
                                                                head_id:
                                                                    row.head.id,
                                                            },
                                                        )
                                                    }
                                                    className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full"
                                                    title="Delete Office Head"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className={`bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white ${
                                                        isHighlighted
                                                            ? "animate-bounce bg-blue-600 font-semibold text-white shadow-lg shadow-blue-200"
                                                            : ""
                                                    }`}
                                                    onClick={() => {
                                                        openDepartmentModal(
                                                            "assign-office-head",
                                                            {
                                                                office_id:
                                                                    row.office
                                                                        .id,
                                                            },
                                                        );
                                                    }}
                                                    title="Assign Office Head"
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center p-5 text-gray-500"
                                >
                                    No Offices Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center mt-4">
                <div className="text-sm text-gray-500 font-medium">
                    Showing {startIndex} to {endIndex} of {totalEntries} entries
                </div>

                <div className="ml-auto">
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationPrevious
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                            />
                            <PaginationContent>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={currentPage === i + 1}
                                            onClick={() =>
                                                handlePageChange(i + 1)
                                            }
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                            <PaginationNext
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                            />
                        </Pagination>
                    )}
                </div>
            </div>

            <ConfirmPasswordDialog
                trigger={null}
                title="Delete Office Head"
                description="You are about to permanently remove this office head assignment."
                itemLabel="Office Head"
                itemName={deleteOfficeHeadModal?.employee_name || ""}
                action={
                    deleteOfficeHeadModal?.id
                        ? route(
                              "departmenthead.destroy",
                              deleteOfficeHeadModal.id,
                          )
                        : ""
                }
                method="delete"
                open={!!deleteOfficeHeadModal}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) closeDepartmentModal();
                }}
            />
        </div>
    );
};

export default DepartmentHeadList;
