import React from "react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const DeleteDepartmentModal = ({ department = null, trigger }) => {
    return (
        <ConfirmPasswordDialog
            trigger={
                trigger || (
                    <Button className="rounded-full bg-red-200 text-red-600 hover:bg-red-600 hover:text-white">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )
            }
            title="Delete Division"
            description="This will permanently remove the division."
            itemLabel="Division"
            itemName={department?.name || ""}
            action={route("department.destroy", department?.id)}
            method="delete"
        />
    );
};

export default DeleteDepartmentModal;
