"use client"

import { useState, useEffect } from "react"
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
import { Calendar, Clock, Filter, HandIcon as HandRaised, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { openSwapsApi, swapRequestsApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

type OpenSwap = {
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
  volunteers: any[]
  createdAt: string
  requesterName: string
  requesterRole: string
}

export default function OpenSwapsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false)
  const [selectedSwap, setSelectedSwap] = useState<OpenSwap | null>(null)
  const [volunteerNote, setVolunteerNote] = useState("")
  const [openSwaps, setOpenSwaps] = useState<OpenSwap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      loadOpenSwaps()
    }
  }, [user, roleFilter])

  const loadOpenSwaps = async () => {
    try {
      setIsLoading(true)
      // const params: { role?: string; search?: string } = {}
      // if (roleFilter !== "all") {
      //   params.role = roleFilter
      // }
      // if (searchTerm) {
      //   params.search = searchTerm
      // }

      const response = await openSwapsApi.getOpenSwaps()
      setOpenSwaps(response.openSwaps)
    } catch (error) {
      console.error("Error loading open swaps:", error)
      toast({
        title: "Error",
        description: "Failed to load open swaps. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    loadOpenSwaps()
  }

  const handleVolunteer = (swap: OpenSwap) => {
    setSelectedSwap(swap)
    setVolunteerNote("")
    setIsVolunteerDialogOpen(true)
  }

  const handleSubmitVolunteer = async () => {
    if (!selectedSwap) return

    try {
      setIsSubmitting(true)
      await swapRequestsApi.volunteerForSwap(selectedSwap.id, { note: volunteerNote })

      toast({
        title: "Success",
        description: "You have volunteered for this shift swap.",
      })

      setIsVolunteerDialogOpen(false)
      loadOpenSwaps()
    } catch (error) {
      console.error("Error volunteering for swap:", error)
      toast({
        title: "Error",
        description: "Failed to volunteer for this swap. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Open Swaps</h1>
          <p className="text-muted-foreground">Browse and volunteer for available shift swaps</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6 flex items-center justify-center h-64">
              <p>Loading open swaps...</p>
            </CardContent>
          </Card>
        ) : openSwaps.length > 0 ? (
          <div className="grid gap-4">
            {openSwaps.map((swap) => (
              <Card key={swap.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{swap.requesterName}</h3>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {swap.requesterRole}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(swap.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {swap.startTime} - {swap.endTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{swap.location}</p>
                        <Badge variant="outline">{swap.role}</Badge>
                      </div>
                      <p className="text-sm mt-2">
                        <span className="font-medium">Reason: </span>
                        {swap.reason}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-muted-foreground">
                        Posted{" "}
                        {new Date(swap.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </p>
                      <Button className="w-full" onClick={() => handleVolunteer(swap)}>
                        <HandRaised className="mr-2 h-4 w-4" />
                        Volunteer
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
              <p className="text-muted-foreground">No open swap requests match your filters.</p>
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
      </div>

      {/* Volunteer Dialog */}
      <Dialog open={isVolunteerDialogOpen} onOpenChange={setIsVolunteerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Volunteer for Shift</DialogTitle>
            <DialogDescription>Confirm that you want to volunteer for this shift swap.</DialogDescription>
          </DialogHeader>
          {selectedSwap && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium">Requester</h4>
                  <p className="text-sm">{selectedSwap.requesterName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Shift Details</h4>
                  <p className="text-sm">
                    {new Date(selectedSwap.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm">
                    {selectedSwap.startTime} - {selectedSwap.endTime}
                  </p>
                  <p className="text-sm">{selectedSwap.role}</p>
                  <p className="text-sm">{selectedSwap.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Reason</h4>
                  <p className="text-sm">{selectedSwap.reason}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Add a note (optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Add any additional information..."
                  rows={3}
                  value={volunteerNote}
                  onChange={(e) => setVolunteerNote(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVolunteerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitVolunteer} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm Volunteer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
