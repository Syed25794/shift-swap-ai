type FetchOptions = {
  method?: string
  body?: any
  headers?: Record<string, string>
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = localStorage.getItem("token")

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers,
  }

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body)
  }

  const response = await fetch(endpoint, fetchOptions)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "An unknown error occurred" }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}

// API functions for shifts
export const shiftsApi = {
  getShifts: (params?: { userId?: string; date?: string; startDate?: string; endDate?: string, status? : string }) => {
    const queryParams = new URLSearchParams()
    if (params?.userId) queryParams.append("userId", params.userId)
    if (params?.date) queryParams.append("date", params.date)
    if (params?.startDate) queryParams.append("startDate", params.startDate)
    if (params?.endDate) queryParams.append("endDate", params.endDate)
    if (params?.status) queryParams.append("status", params.status)

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchApi(`/api/shifts${query}`)
  },
  importShifts: (shifts: any[]) => {
    return fetchApi("/api/shifts", {
      method: "POST",
      body: shifts,
    })
  },
}

// API functions for swap requests
export const swapRequestsApi = {
  getSwapRequests: (params?: { userId?: string; status?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.userId) queryParams.append("userId", params.userId)
    if (params?.status) queryParams.append("status", params.status)

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchApi(`/api/swap-requests${query}`)
  },
  getSwapRequest: (id: string) => {
    return fetchApi(`/api/swap-requests/${id}`)
  },
  createSwapRequest: (data: { shiftId: string; reason: string }) => {
    return fetchApi("/api/swap-requests", {
      method: "POST",
      body: data,
    })
  },
  updateSwapRequest: (id: string, data: { status: string; reason?: string }) => {
    return fetchApi(`/api/swap-requests/${id}`, {
      method: "PUT",
      body: data,
    })
  },
  deleteSwapRequest: (id: string) => {
    return fetchApi(`/api/swap-requests/${id}`, {
      method: "DELETE",
    })
  },
  volunteerForSwap: (id: string, data: { note?: string }) => {
    return fetchApi(`/api/swap-requests/${id}/volunteer`, {
      method: "POST",
      body: data,
    })
  },
}

// API functions for open swaps
export const openSwapsApi = {
  getOpenSwaps: () => {
    // params?: { role?: string; search?: string }
    // const queryParams = new URLSearchParams()
    // if (params?.role) queryParams.append("role", params.role)
    // if (params?.search) queryParams.append("search", params.search)

    // const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchApi(`/api/open-swaps`)
  },
}

// API functions for approvals
export const approvalsApi = {
  getApprovals: (params?: { status?: string; role?: string; search?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append("status", params.status)
    // if (params?.role) queryParams.append("role", params.role)
    // if (params?.search) queryParams.append("search", params.search)

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchApi(`/api/approvals${query}`)
  },
  getApprovalHistory: (params?: { role?: string; search?: string }) => {
    // const queryParams = new URLSearchParams()
    // if (params?.role) queryParams.append("role", params.role)
    // if (params?.search) queryParams.append("search", params.search)

    // const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchApi(`/api/approvals/history`)
  },
}

// API functions for analytics
export const analyticsApi = {
  getAnalytics: (params?: { timeRange?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.timeRange) queryParams.append("timeRange", params.timeRange)

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchApi(`/api/analytics${query}`)
  },
}

// API functions for user profile
export const userApi = {
  getProfile: () => {
    return fetchApi("/api/users/profile")
  },
  updateProfile: (data: any) => {
    return fetchApi("/api/users/profile", {
      method: "PUT",
      body: data,
    })
  },
}
