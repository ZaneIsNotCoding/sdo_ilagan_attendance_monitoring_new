import React from "react";

export default function RightPanels({
    users,
    selectedStation,
    slipPage,
    setSlipPage,
    travelPage,
    setTravelPage,
    sidePerPage,
}) {
    const filteredUsers =
        selectedStation === "All Stations"
            ? users
            : users.filter((u) => u.station === selectedStation);

    const withSlipUsers = filteredUsers.filter((u) => u.withSlip);
    const onTravelUsers = filteredUsers.filter((u) => u.onTravel);

    return (
        <div className="flex flex-col gap-4">
            {/* WITH SLIP */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
                <h2 className="flex justify-between items-center text-sm font-semibold mb-3">
                    🟡 WITH SLIP
                    <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full">
                        {withSlipUsers.length}
                    </span>
                </h2>

                <div className="space-y-2">
                    {withSlipUsers
                        .slice(
                            (slipPage - 1) * sidePerPage,
                            slipPage * sidePerPage,
                        )
                        .map((user, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-xs border-l-4 border-yellow-400"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px]">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="truncate">
                                        {user.name}
                                    </span>
                                </div>

                                <span className="text-[10px] text-gray-400 truncate">
                                    {user.station}
                                </span>
                            </div>
                        ))}
                </div>

                {Math.ceil(withSlipUsers.length / sidePerPage) > 1 && (
                    <div className="flex justify-between items-center mt-3 text-xs">
                        <button
                            onClick={() =>
                                setSlipPage((p) => Math.max(p - 1, 1))
                            }
                            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Prev
                        </button>

                        <span className="text-gray-500">
                            {slipPage} /{" "}
                            {Math.ceil(withSlipUsers.length / sidePerPage)}
                        </span>

                        <button
                            onClick={() =>
                                setSlipPage((p) =>
                                    Math.min(
                                        p + 1,
                                        Math.ceil(
                                            withSlipUsers.length / sidePerPage,
                                        ),
                                    ),
                                )
                            }
                            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* ON TRAVEL */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
                <h2 className="flex justify-between items-center text-sm font-semibold mb-3">
                    🟣 ON TRAVEL
                    <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {onTravelUsers.length}
                    </span>
                </h2>

                <div className="space-y-2">
                    {onTravelUsers
                        .slice(
                            (travelPage - 1) * sidePerPage,
                            travelPage * sidePerPage,
                        )
                        .map((user, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-xs border-l-4 border-purple-500"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px]">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="truncate">
                                        {user.name}
                                    </span>
                                </div>

                                <span className="text-[10px] text-gray-400 truncate">
                                    {user.station}
                                </span>
                            </div>
                        ))}
                </div>

                {Math.ceil(onTravelUsers.length / sidePerPage) > 1 && (
                    <div className="flex justify-between items-center mt-3 text-xs">
                        <button
                            onClick={() =>
                                setTravelPage((p) => Math.max(p - 1, 1))
                            }
                            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Prev
                        </button>

                        <span className="text-gray-500">
                            {travelPage} /{" "}
                            {Math.ceil(onTravelUsers.length / sidePerPage)}
                        </span>

                        <button
                            onClick={() =>
                                setTravelPage((p) =>
                                    Math.min(
                                        p + 1,
                                        Math.ceil(
                                            onTravelUsers.length / sidePerPage,
                                        ),
                                    ),
                                )
                            }
                            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
