"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();
  // useSearchParams is a hook that returns the current URL search parameters as a URLSearchParams object.
  // usePathname is a hook that returns the current URL pathname as a string.
  // useRouter is a hook that returns the router object, which provides methods for navigating and manipulating the URL.

  // console.log("searchParams.get", searchParams.get("query"));

  const handleSearch = useDebouncedCallback((term: string) => {
    // console.log(`Searching... ${term}`);
    // URLSearchParams is a Web API that providesutility methods for manipulating the URL query parameters
    const params = new URLSearchParams(searchParams); // copied the current search params for modification
    params.set("page", "1"); // reset the page to 1 when searching
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathName}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
