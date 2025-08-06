import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SearchResults } from "@/lib/types";

interface SearchBarProps {
  onSearchResults: (results: SearchResults | null) => void;
}

export function SearchBar({ onSearchResults }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const { data: searchResults } = useQuery({
    queryKey: ["/api/search", searchQuery],
    enabled: searchQuery.length >= 2,
    staleTime: 30000,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchActive(query.length >= 2);
    
    if (query.length < 2) {
      onSearchResults(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchActive(false);
    onSearchResults(null);
  };

  // Update search results when data changes
  useEffect(() => {
    if (isSearchActive && searchResults) {
      onSearchResults(searchResults);
    } else if (!isSearchActive) {
      onSearchResults(null);
    }
  }, [searchResults, isSearchActive, onSearchResults]);

  return (
    <div className="relative w-96">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        placeholder="Search sectors, industries, companies..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
      />
      {isSearchActive && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={clearSearch}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
