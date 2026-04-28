import React, { useEffect, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PositionList from "./Partials/PositionList";
import AddPositionForm from "./Partials/AddPositionForm";
import useFlashToast from "@/hooks/useFlashToast";
import EditPositionForm from "./Partials/EditPositionForm";

const Index = () => {
    const { positions, queryParams = {} } = usePage().props;
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);

    const handleEdit = (position) => {
        setSelectedPosition(position);
        setOpenEdit(true);
    };

    const handleAdd = () => {
        setOpen(true);
    };
    useFlashToast();

    return (
        <AuthenticatedLayout header="Position Management">
            <Head title="Positions" />

            <main>
                <PositionList
                    positions={positions}
                    queryParams={queryParams}
                    handleEdit={handleEdit}
                    handleAdd={handleAdd}
                />

                <AddPositionForm open={open} setOpen={setOpen} />
                <EditPositionForm
                    open={openEdit}
                    setOpen={setOpenEdit}
                    position={selectedPosition}
                />
            </main>
        </AuthenticatedLayout>
    );
};

export default Index;
