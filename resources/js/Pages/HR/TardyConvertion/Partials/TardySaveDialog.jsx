import React from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/Components/ui/button";

export const TardySaveDialog = ({ groupedByEmployee, handleSave }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="green">Save All Summaries</Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    {groupedByEmployee.length > 0
                        ? "Confirm Save"
                        : "No Records to Save"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {groupedByEmployee.length > 0
                        ? "Are you sure you want to save all tardiness summaries? This action cannot be undone."
                        : "There are no records to save at this moment."}
                </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
                {groupedByEmployee.length > 0 && (
                    <AlertDialogAction
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Confirm
                    </AlertDialogAction>
                )}
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

