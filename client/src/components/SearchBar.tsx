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
    <div className="flex-1 max-w-lg mx-8">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search sectors, industries, or companies..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-10"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
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
    </div>
  );
}
