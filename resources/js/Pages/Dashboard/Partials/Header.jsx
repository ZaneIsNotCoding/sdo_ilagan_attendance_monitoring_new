import React from "react";

function Clock() {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <span className="text-lg font-medium whitespace-nowrap">
            {time.toLocaleTimeString()}
        </span>
    );
}

export default function Header({
    selectedStation,
    setSelectedStation,
    open,
    setOpen,
    search,
    setSearch,
    dropdownRef,
    stationList,
    users,
}) {
    const getCounts = (station) => {
        const list =
            station === "All Stations"
                ? users
                : users.filter((u) => u.station === station);

        return {
            in: list.filter((u) => u.active).length,
            out: list.filter((u) => !u.active && u.time !== "No Logs").length,
            noLogs: list.filter((u) => u.time === "No Logs").length,
        };
    };

    const filteredStations =
        search.trim() === ""
            ? stationList
            : stationList.filter((s) =>
                  s.toLowerCase().includes(search.toLowerCase()),
              );

    return (
        <div className="sticky top-0 bg-white shadow px-6 py-4 flex justify-between items-center">
            <h1 className="flex items-center gap-2 font-semibold">
                <img src="/logo-copy.png" className="w-6 h-6" />
                TimeVault
            </h1>

            <div className="flex items-center gap-4">
                <div ref={dropdownRef} className="relative">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 border px-4 py-1.5 rounded-full text-sm bg-gray-50"
                    >
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {getCounts(selectedStation).in}
                        </span>
                        {selectedStation}▾
                    </button>

                    {open && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg">
                            <div className="p-2 border-b">
                                <input
                                    type="text"
                                    placeholder="Search station..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-lg"
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto">
                                {filteredStations.map((station) => {
                                    const counts = getCounts(station);

                                    return (
                                        <div
                                            key={station}
                                            onClick={() => {
                                                setSelectedStation(station);
                                                setOpen(false);
                                                setSearch("");
                                            }}
                                            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between"
                                        >
                                            <span>{station}</span>

                                            <div className="flex gap-2 text-xs">
                                                <span className="text-green-600">
                                                    {counts.in}
                                                </span>
                                                <span className="text-red-500">
                                                    {counts.out}
                                                </span>
                                                <span className="text-gray-400">
                                                    {counts.noLogs}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <Clock />
            </div>
        </div>
    );
}
