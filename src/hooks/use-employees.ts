import { useQuery, useQueries } from "@tanstack/react-query";
import { getDepartments, getPositions } from "@/lib/actions/employee";
import { Employee } from "@/types/project";

const API_BASE = "/api/employees";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: () => getPositions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      // Use the simple employees endpoint
      const response = await fetch(`${API_BASE}/simple`);

      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status}`);
      }

      const employees = await response.json();

      // The simple API returns employees directly, no need to extract from data property
      return employees;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// New hook that fetches departments and positions in parallel (like Promise.all)
export function useDepartmentsAndPositions() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["departments"],
        queryFn: getDepartments,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["positions"],
        queryFn: () => getPositions(),
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  const [departmentsQuery, positionsQuery] = results;

  return {
    // Data
    departments: departmentsQuery.data ?? [],
    positions: positionsQuery.data ?? [],

    // Loading states
    isLoading: departmentsQuery.isLoading || positionsQuery.isLoading,
    isDepartmentsLoading: departmentsQuery.isLoading,
    isPositionsLoading: positionsQuery.isLoading,

    // Error states
    hasError: departmentsQuery.isError || positionsQuery.isError,
    departmentsError: departmentsQuery.error,
    positionsError: positionsQuery.error,

    // Success states
    isSuccess: departmentsQuery.isSuccess && positionsQuery.isSuccess,

    // Individual query objects (if you need more granular control)
    departmentsQuery,
    positionsQuery,
  };
}
