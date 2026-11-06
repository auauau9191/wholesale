import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/services/adminService";

/** The AppSettings record, shared across the app by the query cache. */
export default function useAppSettings() {
  return useQuery({
    queryKey: ["appSettings"],
    queryFn: getSettings,
    staleTime: 60 * 1000,
  });
}