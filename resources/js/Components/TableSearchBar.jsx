import { router } from "@inertiajs/react";
import React, { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TableSearchBar = ({
    url,
    queryParams: rawParams = {},
    label = "Search",
    field = "search",
    placeholder,
    preserveState = true,
    replace = true,
    className = "",
}) => {
    const [query, setQuery] = useState(rawParams[field] ?? "");

    useEffect(() => {
        setQuery(rawParams[field] ?? "");
    }, [rawParams, field]);

    // ✅ Dynamic width based on label length
    const widthClass = useMemo(() => {
        const length = label.length;

        if (length <= 10) return "max-w-xs"; // short label
        if (length <= 20) return "max-w-sm"; // medium
        if (length <= 35) return "max-w-md"; // long
        return "max-w-lg"; // very long
    }, [label]);

    const searchFieldName = (fieldName, value) => {
        const params = { ...rawParams };

        if (value && value.trim() !== "") {
            params[fieldName] = value;
        } else {
            delete params[fieldName];
        }

        delete params.page;

        router.get(route(url), params, {
            preserveState,
            replace,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        searchFieldName(field, query);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchFieldName(field, e.target.value);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex items-center gap-2 w-full ${widthClass} ${className}`}
        >
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                <Input
                    type="text"
                    name={field}
                    value={query}
                    placeholder={placeholder || label}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9"
                />
            </div>

            <div className="relative group">
                <Button
                    type="submit"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white"
                >
                    <Search className="h-4 w-4" />
                </Button>

                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-3 py-1.5 rounded-md bg-blue-700 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Search
                </div>
            </div>
        </form>
    );
};

export default TableSearchBar;
