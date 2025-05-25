"use client";

import React, { useState } from "react";
import { Filter, X, Plus } from "lucide-react";
import { useQueryState, parseAsString, parseAsArrayOf } from "nuqs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface FilterAttribute {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "select";
  options?: { value: string; label: string }[];
}

export interface FilterOperation {
  value: string;
  label: string;
  types: ("text" | "number" | "date" | "boolean" | "select")[];
}

export interface ActiveFilter {
  id: string;
  attribute: string;
  operation: string;
  value: string;
  attributeLabel: string;
  operationLabel: string;
}

interface TableFilterProps {
  attributes: FilterAttribute[];
  className?: string;
  onFiltersChange?: (filters: ActiveFilter[]) => void;
}

const DEFAULT_OPERATIONS: FilterOperation[] = [
  { value: "equals", label: "Equals", types: ["text", "number", "date", "boolean", "select"] },
  { value: "not_equals", label: "Not Equals", types: ["text", "number", "date", "boolean", "select"] },
  { value: "contains", label: "Contains", types: ["text"] },
  { value: "not_contains", label: "Does Not Contain", types: ["text"] },
  { value: "starts_with", label: "Starts With", types: ["text"] },
  { value: "ends_with", label: "Ends With", types: ["text"] },
  { value: "greater_than", label: "Greater Than", types: ["number", "date"] },
  { value: "greater_than_equal", label: "Greater Than or Equal", types: ["number", "date"] },
  { value: "less_than", label: "Less Than", types: ["number", "date"] },
  { value: "less_than_equal", label: "Less Than or Equal", types: ["number", "date"] },
  { value: "is_empty", label: "Is Empty", types: ["text", "number", "date"] },
  { value: "is_not_empty", label: "Is Not Empty", types: ["text", "number", "date"] },
];

export function TableFilter({ attributes, className, onFiltersChange }: TableFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<string>("");
  const [selectedOperation, setSelectedOperation] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");

  // Local state for filters when using callback mode
  const [localFilters, setLocalFilters] = useState<ActiveFilter[]>([]);

  // URL state management with nuqs (only when not using callback mode)
  const [urlFilters, setUrlFilters] = useQueryState("filters", parseAsArrayOf(parseAsString).withDefault([]));

  // Use local filters when callback is provided, otherwise use URL filters
  const activeFilters: ActiveFilter[] = onFiltersChange
    ? localFilters
    : (urlFilters
        .map((filterStr) => {
          try {
            return JSON.parse(filterStr) as ActiveFilter;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as ActiveFilter[]);

  // Get available operations for selected attribute
  const getAvailableOperations = (attributeKey: string): FilterOperation[] => {
    const attribute = attributes.find((attr) => attr.key === attributeKey);
    if (!attribute) return [];

    return DEFAULT_OPERATIONS.filter((op) => op.types.includes(attribute.type));
  };

  // Add new filter
  const addFilter = () => {
    if (!selectedAttribute || !selectedOperation) {
      return;
    }

    // Check if value is required for this operation
    const operationsWithoutValue = ["is_empty", "is_not_empty"];
    if (!operationsWithoutValue.includes(selectedOperation) && !searchValue.trim()) {
      return;
    }

    const attribute = attributes.find((attr) => attr.key === selectedAttribute);
    const operation = DEFAULT_OPERATIONS.find((op) => op.value === selectedOperation);

    if (!attribute || !operation) return;

    const newFilter: ActiveFilter = {
      id: `${selectedAttribute}-${selectedOperation}-${Date.now()}`,
      attribute: selectedAttribute,
      operation: selectedOperation,
      value: operationsWithoutValue.includes(selectedOperation) ? "" : searchValue.trim(),
      attributeLabel: attribute.label,
      operationLabel: operation.label,
    };

    const updatedFilters = [...activeFilters, newFilter];

    if (onFiltersChange) {
      // Use callback mode with local state
      setLocalFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    } else {
      // Use URL state management
      const serializedFilters = updatedFilters.map((filter) => JSON.stringify(filter));
      setUrlFilters(serializedFilters);
    }

    // Reset form
    setSelectedAttribute("");
    setSelectedOperation("");
    setSearchValue("");
    setIsFilterOpen(false);
  };

  // Remove filter
  const removeFilter = (filterId: string) => {
    const updatedFilters = activeFilters.filter((filter) => filter.id !== filterId);

    if (onFiltersChange) {
      // Use callback mode with local state
      setLocalFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    } else {
      // Use URL state management
      const serializedFilters = updatedFilters.map((filter) => JSON.stringify(filter));
      setUrlFilters(serializedFilters);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    if (onFiltersChange) {
      // Use callback mode with local state
      setLocalFilters([]);
      onFiltersChange([]);
    } else {
      // Use URL state management
      setUrlFilters([]);
    }
  };

  // Handle attribute selection
  const handleAttributeSelect = (attributeKey: string) => {
    setSelectedAttribute(attributeKey);
    setSelectedOperation(""); // Reset operation when attribute changes
  };

  // Render input based on attribute type
  const renderSearchInput = () => {
    const attribute = attributes.find((attr) => attr.key === selectedAttribute);
    if (!attribute) return null;

    switch (attribute.type) {
      case "select":
        return (
          <Select
            value={searchValue}
            onValueChange={setSearchValue}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              {attribute.options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "boolean":
        return (
          <Select
            value={searchValue}
            onValueChange={setSearchValue}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      case "date":
        return (
          <Input
            type="date"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Select date..."
            className="w-full"
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter number..."
            className="w-full"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter search term..."
            className="w-full"
          />
        );
    }
  };

  const canAddFilter =
    selectedAttribute &&
    selectedOperation &&
    (searchValue.trim() || ["is_empty", "is_not_empty"].includes(selectedOperation));

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Add Filter
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-4"
            align="start"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Column</label>
                <Select
                  value={selectedAttribute}
                  onValueChange={handleAttributeSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    {attributes.map((attr) => (
                      <SelectItem
                        key={attr.key}
                        value={attr.key}
                      >
                        {attr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAttribute && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Operation</label>
                  <Select
                    value={selectedOperation}
                    onValueChange={setSelectedOperation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableOperations(selectedAttribute).map((op) => (
                        <SelectItem
                          key={op.value}
                          value={op.value}
                        >
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedAttribute && selectedOperation && !["is_empty", "is_not_empty"].includes(selectedOperation) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  {renderSearchInput()}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={addFilter}
                  disabled={!canAddFilter}
                  size="sm"
                  className="flex-1"
                >
                  Add Filter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1"
            >
              <span className="text-xs">
                <span className="font-medium">{filter.attributeLabel}</span>{" "}
                <span className="text-muted-foreground">{filter.operationLabel}</span>
                {!["is_empty", "is_not_empty"].includes(filter.operation) && (
                  <>
                    {" "}
                    <span className="font-medium">&quot;{filter.value}&quot;</span>
                  </>
                )}
              </span>
              <button
                onClick={() => removeFilter(filter.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Filter Summary */}
      {activeFilters.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {activeFilters.length} filter{activeFilters.length !== 1 ? "s" : ""} applied
        </div>
      )}
    </div>
  );
}
