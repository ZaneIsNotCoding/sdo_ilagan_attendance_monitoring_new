import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";

const ITEMS_PER_PAGE = 10;

const SchoolAdminList = ({ school_admins = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [admins, setAdmins] = useState(school_admins);

    const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);

    const paginatedAdmins = admins.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">
                    School Admin List
                </h2>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    + Add
                </Button>
            </div>

            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow className="bg-blue-900 hover:bg-blue-800">
                        <TableHead className="text-center text-white">
                            Name
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Position
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Department
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paginatedAdmins.map((admin) => (
                        <TableRow key={admin.id} className="hover:bg-gray-100">
                            <TableCell className="text-center">
                                {admin.full_name ||
                                    `${admin.first_name} ${admin.last_name}`}
                            </TableCell>

                            <TableCell className="text-center">
                                {admin.position || "School Admin"}
                            </TableCell>

                            <TableCell className="text-center">
                                {admin.department || "-"}
                            </TableCell>

                            <TableCell className="flex justify-center gap-2">
                                <ConfirmPasswordDialog
                                    trigger={
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="rounded-full text-black hover:bg-red-400 hover:text-white"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    }
                                    title="Delete School Admin"
                                    description="You are about to remove this school admin."
                                    itemLabel="School Admin"
                                    itemName={
                                        admin.full_name ||
                                        `${admin.last_name}, ${admin.first_name}`
                                    }
                                    note="This action may affect system permissions."
                                    action={route(
                                        "schooladmin.destroy",
                                        admin.id
                                    )}
                                    method="delete"
                                    confirmText="Yes, Delete"
                                    processingText="Deleting..."
                                    danger={true}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination className="my-2 justify-end">
                    <PaginationPrevious
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    />
                    <PaginationContent>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    isActive={currentPage === i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                    <PaginationNext
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    />
                </Pagination>
            )}
        </div>
    );
};

export default SchoolAdminList;