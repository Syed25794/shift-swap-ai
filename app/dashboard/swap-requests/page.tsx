"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Calendar, Clock, RefreshCcw, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { swapRequestsApi, shiftsApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

type SwapRequest = {
  id: string
  userId: string
  shiftId: string
  date: string
  startTime: string
  endTime: string
  role: string
  location: string
  status: string
  reason: string
  volunteers: Array<{
    id: string
    userId: string
    name: string
    role: string
  }>
  createdAt: string
  requesterName: string
  requesterRole: string
  matchedAt?: string
  rejectionReason?: string
}

type Shift = {
  id: string
  userId: string
  date: string
  startTime: string
  endTime: string
  role: string
  location: string
}

export default function SwapRequestsPage() {
  const { user } = useAuth()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null)
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedShift, setSelectedShift] = useState<string>("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (user) {
      loadSwapRequests()
      loadShifts()
    }
  }, [user])

  const loadSwapRequests = async () => {
    try {
      setIsLoading(true)
      const response = await swapRequestsApi.getSwapRequests({ userId: user?.id })
      setSwapRequests(response.swapRequests)
    } catch (error) {
      console.error("Error loading swap requests:", error)
      toast({
        title: "Error",
        description: "Failed to load swap requests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadShifts = async () => {
    try {
      const response = await shiftsApi.getShifts({ userId: user?.id, status : 'matched' })
      setShifts(response.shifts)
    } catch (error) {
      console.error("Error loading shifts:", error)
    }
  }

  const handleViewRequest = (request: SwapRequest) => {
    setSelectedRequest(request)
    setIsViewDialogOpen(true)
  }

  const handleCreateRequest = async () => {
    if (!selectedShift || !reason.trim()) return

    try {
      setIsSubmitting(true)
      await swapRequestsApi.createSwapRequest({
        shiftId: selectedShift,
        reason,
      })

      toast({
        title: "Success",
        description: "Swap request created successfully.",
      })

      setIsCreateDialogOpen(false)
      setSelectedShift("")
      setReason("")
      loadSwapRequests()
    } catch (error) {
      console.error("Error creating swap request:", error)
      toast({
        title: "Error",
        description: "Failed to create swap request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      setIsCancelling(true)
      await swapRequestsApi.deleteSwapRequest(requestId)

      toast({
        title: "Success",
        description: "Swap request cancelled successfully.",
      })

      loadSwapRequests()
    } catch (error) {
      console.error("Error cancelling swap request:", error)
      toast({
        title: "Error",
        description: "Failed to cancel swap request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Awaiting Volunteers
          </Badge>
        )
      case "matched":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Matched, Pending Approval
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingRequests = swapRequests.filter((req) => req.status === "pending" || req.status === "matched")
  const historyRequests = swapRequests.filter(
    (req) => req.status === "approved" || req.status === "completed" || req.status === "rejected",
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Swap Requests</h1>
            <p className="text-muted-foreground">Manage your shift swap requests</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            New Swap Request
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6 flex items-center justify-center h-64">
              <p>Loading swap requests...</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active Requests</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-4">
              {pendingRequests.length > 0 ? (
                <div className="grid gap-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{request.role}</h3>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(request.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {request.startTime} - {request.endTime}
                            </div>
                            <p className="text-sm text-muted-foreground">{request.location}</p>
                          </div>
                          <div className="space-y-2">
                            {request.volunteers.length > 0 ? (
                              <div className="rounded-lg border p-3 bg-muted/50">
                                <p className="text-sm font-medium">Volunteer:</p>
                                <p className="text-sm">{request.volunteers[0].name}</p>
                                <p className="text-xs text-muted-foreground">Role: {request.volunteers[0].role}</p>
                              </div>
                            ) : (
                              <Alert variant="warning" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>No volunteers yet</AlertDescription>
                              </Alert>
                            )}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleViewRequest(request)}
                              >
                                View Details
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={() => handleCancelRequest(request.id)}
                                disabled={isCancelling}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">You don't have any active swap requests.</p>
                    <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Create New Request
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              {historyRequests.length > 0 ? (
                <div className="grid gap-4">
                  {historyRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{request.role}</h3>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(request.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {request.startTime} - {request.endTime}
                            </div>
                            <p className="text-sm text-muted-foreground">{request.location}</p>
                          </div>
                          <div className="space-y-2">
                            {request.volunteers.length > 0 && (
                              <div className="rounded-lg border p-3 bg-muted/50">
                                <p className="text-sm font-medium">Swapped with:</p>
                                <p className="text-sm">{request.volunteers[0].name}</p>
                                <p className="text-xs text-muted-foreground">Role: {request.volunteers[0].role}</p>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleViewRequest(request)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">You don't have any past swap requests.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Create Swap Request Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
  <DialogContent className="max-h-[90vh] overflow-y-auto space-y-6 break-words">
    <DialogHeader>
      <DialogTitle>Create Swap Request</DialogTitle>
      <DialogDescription>
        Select a shift you need to swap and provide details.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Shift</Label>
        <div className="grid gap-2">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="flex items-start gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
            >
              <input
                type="radio"
                id={`shift-${shift.id}`}
                name="shift"
                className="h-4 w-4 mt-1"
                checked={selectedShift === shift.id}
                onChange={() => setSelectedShift(shift.id)}
              />
              <label htmlFor={`shift-${shift.id}`} className="flex-1 cursor-pointer">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{shift.role}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(shift.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {shift.startTime} - {shift.endTime}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {shift.location}
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for swap request</Label>
        <Textarea
          id="reason"
          placeholder="Please explain why you need to swap this shift..."
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>
    </div>

    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
        Cancel
      </Button>
      <Button
        onClick={handleCreateRequest}
        disabled={isSubmitting || !selectedShift || !reason.trim()}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      {/* View Swap Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Swap Request Details</DialogTitle>
            <DialogDescription>View the details of your swap request.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Status</h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium">Shift Details</h4>
                    <p className="text-sm">
                      {new Date(selectedRequest.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm">
                      {selectedRequest.startTime} - {selectedRequest.endTime}
                    </p>
                    <p className="text-sm">{selectedRequest.role}</p>
                    <p className="text-sm">{selectedRequest.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Reason</h4>
                    <p className="text-sm">{selectedRequest.reason}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Request Created</h4>
                    <p className="text-sm">
                      {new Date(selectedRequest.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </p>
                  </div>
                  {selectedRequest.rejectionReason && (
                    <div>
                      <h4 className="text-sm font-medium">Rejection Reason</h4>
                      <p className="text-sm">{selectedRequest.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
              {selectedRequest.volunteers.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Volunteer</h3>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">{selectedRequest.volunteers[0].name}</p>
                    <p className="text-sm text-muted-foreground">Role: {selectedRequest.volunteers[0].role}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
