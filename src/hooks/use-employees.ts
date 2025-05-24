import { useQuery, useQueries } from "@tanstack/react-query";
import { getDepartments, getPositions, getEmployees } from "@/lib/actions/employee";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePositions(departmentId?: string) {
  return useQuery({
    queryKey: ["positions", departmentId],
    queryFn: () => getPositions(departmentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    staleTime: 2 * 60 * 1000, // 2 minutes
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
