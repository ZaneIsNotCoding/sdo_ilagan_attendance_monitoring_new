import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddSchoolAdminForm from "./AddSchoolAdminForm";

const SchoolAdminList = ({ school_admins = [], employees = [], stations = [] }) => {
    const [openAdd, setOpenAdd] = useState(false);

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">School Admin List</h2>

                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setOpenAdd(!openAdd)}
                >
                    + Add
                </Button>
            </div>


            {openAdd && (
                <AddSchoolAdminForm
                    employees={employees}
                    stations={stations}
                    close={() => setOpenAdd(false)}
                />
            )}

            {/* Table */}
            <table className="w-full border">
                <thead>
                    <tr className="bg-blue-900 text-white">
                        <th>Name</th>
                        <th>Position</th>
                        <th>Department</th>
                    </tr>
                </thead>

                <tbody>
                    {school_admins.map((admin) => (
                        <tr key={admin.id} className="text-center">
                            <td>{admin.employee?.full_name ?? "—"}</td>
                            <td>{admin.employee?.position}</td>
                            <td>{admin.employee?.department}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SchoolAdminList;