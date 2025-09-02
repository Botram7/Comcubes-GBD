import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SearchResults } from "@/lib/types";

interface SearchBarProps {
  onSearchResults: (results: any) => void;
  searchMode?: 'local' | 'global';
}

export function SearchBar({ onSearchResults, searchMode = 'local' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const { data: searchResults } = useQuery({
    queryKey: [searchMode === 'global' ? "/api/search/global" : "/api/search", searchQuery, searchMode],
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

  // Update search results when data changes or search mode changes
  useEffect(() => {
    if (isSearchActive && searchResults) {
      onSearchResults(searchResults);
    } else if (!isSearchActive) {
      onSearchResults(null);
    }
  }, [searchResults, isSearchActive, onSearchResults, searchMode]);

  // Clear search when search mode changes to force a new search
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      // The query key change will automatically trigger a refetch
    }
  }, [searchMode, searchQuery]);

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
