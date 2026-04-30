import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import { LandPlot, Save, ShieldCheck } from "lucide-react";

const EditStationModal = ({ open, setOpen, station }) => {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [openConfirm, setOpenConfirm] = useState(false);
    const isSdoAssignment = station?.source === "sdo";
    const action = isSdoAssignment
        ? station?.record_id
            ? route("stationassignments.update", station.record_id)
            : ""
        : station?.id
          ? route("stations.update", station.id)
          : "";

    useEffect(() => {
        if (station) {
            setCode(station.code || "");
            setName(station.name || "");
        }
    }, [station]);

    useEffect(() => {
        if (!open) setOpenConfirm(false);
    }, [open]);

    const canSubmit =
        Boolean(isSdoAssignment ? station?.record_id : station?.id) &&
        name.trim().length > 0 &&
        (code.trim() !== (station?.code || "").trim() ||
            name.trim() !== (station?.name || "").trim());

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
                    <div className="bg-blue-700 px-5 py-4 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-white">
                                <LandPlot className="h-5 w-5" />
                                {isSdoAssignment
                                    ? "Edit SDO Assignment"
                                    : "Edit Station"}
                            </DialogTitle>
                            <DialogDescription className="text-blue-100">
                                Update the code and name.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="space-y-4 px-5 pb-5 pt-4">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-white p-2 shadow-sm">
                                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Protected Update
                                    </p>
                                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                        Editing a station requires password
                                        confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Code
                            </label>
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="h-11 rounded-xl border-blue-200 bg-white text-sm shadow-sm focus-visible:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Station name
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11 rounded-xl border-blue-200 bg-white text-sm shadow-sm focus-visible:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => setOpenConfirm(true)}
                                disabled={!canSubmit}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmPasswordDialog
                trigger={null}
                title={
                    isSdoAssignment
                        ? "Confirm SDO Assignment Update"
                        : "Confirm Station Update"
                }
                description="Please confirm your password before updating this record."
                action={action}
                method="put"
                data={{
                    code: code.trim() || null,
                    name: name.trim(),
                }}
                danger={false}
                itemLabel={isSdoAssignment ? "SDO Assignment" : "Station"}
                itemName={station?.name || ""}
                confirmText={
                    isSdoAssignment ? "Update Assignment" : "Update Station"
                }
                processingText="Updating..."
                note="The record will be saved immediately after password confirmation."
                onSuccess={() => {
                    setOpenConfirm(false);
                    setOpen(false);
                }}
                onError={() => setOpenConfirm(true)}
                open={openConfirm}
                onOpenChange={setOpenConfirm}
            />
        </>
    );
};

export default EditStationModal;
