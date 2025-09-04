import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { addCSRFHeaders } from "./csrf";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log("Making API request:", method, url);
  console.log("Request data:", data);
  
  // Handle FormData properly - don't set Content-Type for FormData (browser sets it automatically with boundary)
  const isFormData = data instanceof FormData;
  
  if (isFormData) {
    console.log("FormData entries:");
    for (let [key, value] of (data as FormData).entries()) {
      console.log(`${key}:`, value);
    }
  }
  
  // Prepare headers with CSRF protection for state-changing requests
  let headers: Record<string, string> = {};
  
  if (!isFormData && data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add CSRF protection for POST, PUT, PATCH, DELETE requests
  if (method.toUpperCase() !== "GET") {
    headers = addCSRFHeaders(headers);
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? (isFormData ? data as FormData : JSON.stringify(data)) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;
    
    // Handle search queries with parameters
    if ((url === "/api/search" || url === "/api/search/global") && queryKey[1]) {
      url = `${url}?q=${encodeURIComponent(queryKey[1] as string)}`;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
