import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react'
import FloatingInput from './floating-input';
import { Search } from "lucide-react";

const SearchInput = ({url, queryParams:rawParams, label}) => {

        const queryParams = rawParams || {};
        const handleSearchSubmit = (e) => {
            e.preventDefault();
            searchFieldName("search", query);
        };

        const [query, setQuery] = useState(queryParams.search ?? "");
        useEffect(() => {
            setQuery(queryParams.search ?? "");
        }, [queryParams.search]);

        const searchFieldName = (field, value) => {
            const params = { ...queryParams };

            if (value && value.trim() !== "") {
                params[field] = value;
            } else {
                delete params[field];
            }

            delete params.page;

            router.get(route(url), params, {
                preserveState: true,
                replace: true,
            });
        };

        const onKeyPressed = (field, e) => {
            if (e.key === "Enter") {
                searchFieldName(field, e.target.value);
            }
        };
  return (
    <form onSubmit={handleSearchSubmit} className="w-full">
        <FloatingInput
            label={label || "Search"}
            icon={Search}
            name="search"
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
            }}
            onKeyDown={(e) => onKeyPressed("search", e)}
        />
    </form>
  )
}

export default SearchInput

