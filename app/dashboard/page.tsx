"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, RefreshCcw, Users } from "lucide-react"
import Link from "next/link"
import React, { useEffect } from "react"
import { Shift } from "@prisma/client"
import { fetchApi } from "@/lib/api-client"

export default function DashboardPage() {
  const { user, isManager } = useAuth()
  const [shifts, setShifts] = React.useState<Shift[]>([])
  const [pendingSwaps, setPendingSwaps] = React.useState([])
  const [openSwaps, setOpenSwaps] = React.useState([])
  const [completedSwaps, setCompletedSwaps] = React.useState([])
  const [allSwaps, setAllSwaps] = React.useState([])

  const fetchShifts = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/shifts", {
        headers : {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error("Failed to fetch shifts")
      }
      const data = await response.json()
      setShifts(data.shifts)
    } catch (error) {
      console.error("Error fetching shifts:", error)
    }
  }

  const fetchSwaps = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/swap-requests", {
        headers : {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error("Failed to fetch swaps")
      }
      const data = await response.json()
      setPendingSwaps(data.pendingSwap)
      setOpenSwaps(data.openSwap)
      setCompletedSwaps(data.completedSwap)
      setAllSwaps(data.swapRequests)
    } catch (error) {
      console.error("Error fetching swaps:", error)
    }
  }

  useEffect(()=>{
    fetchSwaps()
    fetchShifts()
  },[])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your shift management activities</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Shifts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shifts.length}</div>
              <p className="text-xs text-muted-foreground">Upcoming shifts this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Swaps</CardTitle>
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSwaps?.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval or volunteers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Swaps</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openSwaps?.length}</div>
              <p className="text-xs text-muted-foreground">Available for you to volunteer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isManager ? "Pending Approvals" : "Approved Swaps"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isManager ? "5" : completedSwaps?.length}</div>
              <p className="text-xs text-muted-foreground">
                {isManager ? "Waiting for your review" : "Successfully completed this month"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Upcoming Shifts</CardTitle>
              <CardDescription>Your scheduled shifts here</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
  {shifts.map((shift, index) => {
    // Determine whether to use data from SwapRequest or the shift itself
    const swapRequest = shift?.SwapRequest?.length > 0 ? shift?.SwapRequest[0] : null
    const date = swapRequest ? swapRequest.date : shift.date
                const startTime = swapRequest ? swapRequest.startTime : shift.startTime
                const endTime = swapRequest ? swapRequest.endTime : shift.endTime
                const role = swapRequest ? swapRequest.role : shift.role
    const location = swapRequest ? swapRequest.location : shift.location

    return (
      <div key={index} className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-muted-foreground">{`${startTime} - ${endTime}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {role}
          </div>
                      {!swapRequest ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/swap-requests">Request Swap</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
                              {swapRequest.status === "approved" && (
                <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Successfully Swapped
                </div>
              )}
                              {swapRequest.status === "pending" && (
                <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                  Pending Approval
                </div>
              )}
                              {swapRequest.status === "rejected" && (
                <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  Swap Rejected
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  })}
</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
