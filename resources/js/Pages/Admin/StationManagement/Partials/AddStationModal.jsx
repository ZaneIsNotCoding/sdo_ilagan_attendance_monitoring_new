import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LandPlot, Save, Sparkles } from "lucide-react";

const AddStationModal = ({ open, setOpen }) => {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");

    useEffect(() => {
        if (open) {
            setCode("");
            setName("");
        }
    }, [open]);

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(
            route("stations.store"),
            {
                code: code.trim() || null,
                name: name.trim(),
            },
            {
                onSuccess: () => setOpen(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
                <div className="bg-blue-700 px-5 py-4 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <LandPlot className="h-5 w-5" />
                            Add Station
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Create a new station record.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 px-5 pb-5 pt-4"
                >
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-white p-2 shadow-sm">
                                <Sparkles className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Station Details
                                </p>
                                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                    Enter the station code and station name.
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
                            placeholder="Station code"
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
                            placeholder="Station name"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim()}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Save
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddStationModal;
