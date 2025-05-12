"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import jsPDF from "jspdf"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Calendar, Check, Clock, Filter, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { approvalsApi, swapRequestsApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

type Approval = {
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
  matchedAt?: string
  decidedAt?: string
  requesterName: string
  requesterRole: string
  volunteerName: string
  volunteerRole: string
  rejectionReason?: string
}

export default function ApprovalsPage() {
  const { isManager } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [approvalNote, setApprovalNote] = useState("")
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([])
  const [approvalHistory, setApprovalHistory] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect non-managers
  useEffect(() => {
    if (!isManager) {
      router.push("/dashboard")
    }
  }, [isManager, router])

  useEffect(() => {
    if (isManager) {
      loadPendingApprovals()
      loadApprovalHistory()
    }
  }, [isManager, roleFilter])

  const loadPendingApprovals = async () => {
    try {
      setIsLoading(true)
      const params: { status?: string; role?: string; search?: string } = {
        status: "matched",
      }

      // if (roleFilter !== "all") {
      //   params.role = roleFilter
      // }
      // if (searchTerm) {
      //   params.search = searchTerm
      // }

      const response = await approvalsApi.getApprovals(params)
      setPendingApprovals(response.approvals)
    } catch (error) {
      console.error("Error loading pending approvals:", error)
      toast({
        title: "Error",
        description: "Failed to load pending approvals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadApprovalHistory = async () => {
    try {
      setIsHistoryLoading(true)
      // const params: { role?: string; search?: string } = {}

     

      const response = await approvalsApi.getApprovalHistory()
      setApprovalHistory(response.approvalHistory)
    } catch (error) {
      console.error("Error loading approval history:", error)
      toast({
        title: "Error",
        description: "Failed to load approval history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsHistoryLoading(false)
    }
  }

  const handleSearch = () => {
    loadPendingApprovals()
    loadApprovalHistory()
  }

  const handleApprove = (approval: Approval) => {
    setSelectedApproval(approval)
    setApprovalNote("")
    setIsApproveDialogOpen(true)
  }

  const handleReject = (approval: Approval) => {
    setSelectedApproval(approval)
    setRejectionReason("")
    setIsRejectDialogOpen(true)
  }

  const handleView = (approval: Approval) => {
    setSelectedApproval(approval)
    setIsViewDialogOpen(true)
  }

  const handleSubmitApproval = async () => {
    if (!selectedApproval) return

    try {
      setIsSubmitting(true)
      await swapRequestsApi.updateSwapRequest(selectedApproval.id, {
        status: "approved",
      })

      toast({
        title: "Success",
        description: "Swap request approved successfully.",
      })

      setIsApproveDialogOpen(false)
      loadPendingApprovals()
      loadApprovalHistory()
    } catch (error) {
      console.error("Error approving swap request:", error)
      toast({
        title: "Error",
        description: "Failed to approve swap request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  

const handleDownloadCSV = () => {
  const csvData = approvalHistory.map((approval) => ({
    ID: approval.id,
    Requester: approval.requesterName,
    "Requester Role": approval.requesterRole,
    Volunteer: approval.volunteerName,
    "Volunteer Role": approval.volunteerRole,
    Date: approval.date,
    "Start Time": approval.startTime,
    "End Time": approval.endTime,
    Location: approval.location,
    Role: approval.role,
    Status: approval.status,
    "Decision Date": approval.decidedAt
      ? new Date(approval.decidedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A",
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "approval_history.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// const handleDownloadPDF = () => {
//   const doc = new jsPDF()
//   doc.text("Approval History", 10, 10)

//   const tableData = approvalHistory.map((approval) => [
//     approval.id,
//     approval.requesterName,
//     approval.requesterRole,
//     approval.volunteerName,
//     approval.volunteerRole,
//     approval.date,
//     approval.startTime,
//     approval.endTime,
//     approval.location,
//     approval.role,
//     approval.status,
//     approval.decidedAt
//       ? new Date(approval.decidedAt).toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         })
//       : "N/A",
//   ])

//   doc.autoTable({
//     head: [
//       [
//         "ID",
//         "Requester",
//         "Requester Role",
//         "Volunteer",
//         "Volunteer Role",
//         "Date",
//         "Start Time",
//         "End Time",
//         "Location",
//         "Role",
//         "Status",
//         "Decision Date",
//       ],
//     ],
//     body: tableData,
//   })

//   doc.save("approval_history.pdf")
// }

  const handleSubmitRejection = async () => {
    if (!selectedApproval || !rejectionReason.trim()) return

    try {
      setIsSubmitting(true)
      await swapRequestsApi.updateSwapRequest(selectedApproval.id, {
        status: "rejected",
        reason: rejectionReason,
      })

      toast({
        title: "Success",
        description: "Swap request rejected successfully.",
      })

      setIsRejectDialogOpen(false)
      loadPendingApprovals()
      loadApprovalHistory()
    } catch (error) {
      console.error("Error rejecting swap request:", error)
      toast({
        title: "Error",
        description: "Failed to reject swap request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isManager) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">Review and manage shift swap requests</p>
        </div>


        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="history">Approval History</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 flex items-center justify-center h-64">
                  <p>Loading pending approvals...</p>
                </CardContent>
              </Card>
            ) : pendingApprovals.length > 0 ? (
              <div className="grid gap-4">
                {pendingApprovals.map((approval) => (
                  <Card key={approval.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Swap Request</h3>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Pending Approval
                            </Badge>
                          </div>
                          <div className="rounded-lg border p-3 space-y-2">
                            <div className="flex justify-between">
                              <div>
                                <p className="text-sm font-medium">Requester</p>
                                <p className="text-sm">{approval.requesterName}</p>
                                <p className="text-xs text-muted-foreground">Role: {approval.requesterRole}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">Volunteer</p>
                                <p className="text-sm">{approval.volunteerName}</p>
                                <p className="text-xs text-muted-foreground">Role: {approval.volunteerRole}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4" />
                              {new Date(approval.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4" />
                              {approval.startTime} - {approval.endTime}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm">{approval.location}</p>
                              <Badge variant="outline">{approval.role}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-muted-foreground">
                            Requested{" "}
                            {new Date(approval.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Matched{" "}
                            {approval.matchedAt &&
                              new Date(approval.matchedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => handleReject(approval)}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                            <Button size="sm" className="w-full" onClick={() => handleApprove(approval)}>
                              <Check className="mr-2 h-4 w-4" />
                              Approve
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
                  <p className="text-muted-foreground">No pending approvals match your filters.</p>
                  {searchTerm || roleFilter !== "all" ? (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("")
                        setRoleFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            {isHistoryLoading ? (
              <Card>
                <CardContent className="p-6 flex items-center justify-center h-64">
                  <p>Loading approval history...</p>
                </CardContent>
              </Card>
            ) : approvalHistory.length > 0 ? (
              <div className="grid gap-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleDownloadCSV}>
                      Download CSV
                    </Button>
                    {/* <Button variant="outline" onClick={handleDownloadPDF}>
                      Download PDF
                    </Button> */}
                  </div>
                {approvalHistory.map((approval) => (
                  <Card key={approval.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Swap Request</h3>
                            <Badge
                              variant="outline"
                              className={
                                approval.status === "approved"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }
                            >
                              {approval.status === "approved" ? "Approved" : "Rejected"}
                            </Badge>
                          </div>
                          <div className="rounded-lg border p-3 space-y-2">
                            <div className="flex justify-between">
                              <div>
                                <p className="text-sm font-medium">Requester</p>
                                <p className="text-sm">{approval.requesterName}</p>
                                <p className="text-xs text-muted-foreground">Role: {approval.requesterRole}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">Volunteer</p>
                                <p className="text-sm">{approval.volunteerName}</p>
                                <p className="text-xs text-muted-foreground">Role: {approval.volunteerRole}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4" />
                              {new Date(approval.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4" />
                              {approval.startTime} - {approval.endTime}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm">{approval.location}</p>
                              <Badge variant="outline">{approval.role}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-muted-foreground">
                            Decision made{" "}
                            {approval.decidedAt &&
                              new Date(approval.decidedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              })}
                          </p>
                          <Button variant="outline" size="sm" className="w-full" onClick={() => handleView(approval)}>
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
                  <p className="text-muted-foreground">No approval history matches your filters.</p>
                  {searchTerm || roleFilter !== "all" ? (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("")
                        setRoleFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Shift Swap</DialogTitle>
            <DialogDescription>Confirm that you want to approve this shift swap request.</DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Requester</h4>
                    <p className="text-sm">{selectedApproval.requesterName}</p>
                    <p className="text-xs text-muted-foreground">Role: {selectedApproval.requesterRole}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-medium">Volunteer</h4>
                    <p className="text-sm">{selectedApproval.volunteerName}</p>
                    <p className="text-xs text-muted-foreground">Role: {selectedApproval.volunteerRole}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Shift Details</h4>
                  <p className="text-sm">
                    {new Date(selectedApproval.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm">
                    {selectedApproval.startTime} - {selectedApproval.endTime}
                  </p>
                  <p className="text-sm">{selectedApproval.role}</p>
                  <p className="text-sm">{selectedApproval.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Reason</h4>
                  <p className="text-sm">{selectedApproval.reason}</p>
                </div>
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="note">Add a note (optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Add any additional information..."
                  rows={3}
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                />
              </div> */}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitApproval} disabled={isSubmitting}>
              {isSubmitting ? "Approving..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Shift Swap</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this shift swap request.</DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Requester</h4>
                    <p className="text-sm">{selectedApproval.requesterName}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-medium">Volunteer</h4>
                    <p className="text-sm">{selectedApproval.volunteerName}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Shift Details</h4>
                  <p className="text-sm">
                    {new Date(selectedApproval.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm">
                    {selectedApproval.startTime} - {selectedApproval.endTime}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Reason for rejection</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please explain why you are rejecting this request..."
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitRejection}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Swap Request Details</DialogTitle>
            <DialogDescription>View the details of this shift swap request.</DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Status</h3>
                <Badge
                  variant="outline"
                  className={
                    selectedApproval.status === "approved"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {selectedApproval.status === "approved" ? "Approved" : "Rejected"}
                </Badge>
              </div>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Requester</h4>
                    <p className="text-sm">{selectedApproval.requesterName}</p>
                    <p className="text-xs text-muted-foreground">Role: {selectedApproval.requesterRole}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-medium">Volunteer</h4>
                    <p className="text-sm">{selectedApproval.volunteerName}</p>
                    <p className="text-xs text-muted-foreground">Role: {selectedApproval.volunteerRole}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Shift Details</h4>
                  <p className="text-sm">
                    {new Date(selectedApproval.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm">
                    {selectedApproval.startTime} - {selectedApproval.endTime}
                  </p>
                  <p className="text-sm">{selectedApproval.role}</p>
                  <p className="text-sm">{selectedApproval.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Reason for Request</h4>
                  <p className="text-sm">{selectedApproval.reason}</p>
                </div>
                {selectedApproval.status === "rejected" && selectedApproval.rejectionReason && (
                  <div>
                    <h4 className="text-sm font-medium">Reason for Rejection</h4>
                    <p className="text-sm">{selectedApproval.rejectionReason}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium">Timeline</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      Requested:{" "}
                      {new Date(selectedApproval.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </p>
                    {selectedApproval.matchedAt && (
                      <p>
                        Matched:{" "}
                        {new Date(selectedApproval.matchedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </p>
                    )}
                    {selectedApproval.decidedAt && (
                      <p>
                        Decision:{" "}
                        {new Date(selectedApproval.decidedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
