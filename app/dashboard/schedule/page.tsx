"use client"

import type React from "react"
import Papa from "papaparse"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUpDown, CalendarIcon, Clock, Download, FileUp, List, Upload } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { shiftsApi, swapRequestsApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

type Shift = {
  id: string
  userId: string
  date: string
  startTime: string
  endTime: string
  role: string
  location: string
}

export default function SchedulePage() {
  const { user } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isRequestSwapDialogOpen, setIsRequestSwapDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [swapReason, setSwapReason] = useState("")
  const [preferredDates, setPreferredDates] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [csvData, setCsvData] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadShifts()
    }
  }, [user])

  const loadShifts = async () => {
    try {
      setIsLoading(true)
      const response = await shiftsApi.getShifts({ userId: user?.id })
      setShifts(response.shifts)
    } catch (error) {
      console.error("Error loading shifts:", error)
      toast({
        title: "Error",
        description: "Failed to load shifts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter shifts for the selected date
  const shiftsForSelectedDate = date ? shifts.filter((shift) => shift.date === format(date, "yyyy-MM-dd")) : []

  // Filter shifts for the current week
  const currentDate = new Date()
  const currentWeekShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.date)
    const diffTime = Math.abs(shiftDate.getTime() - currentDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  })

  const handleRequestSwap = (shift: Shift) => {
    setSelectedShift(shift)
    setSwapReason("")
    setPreferredDates("")
    setIsRequestSwapDialogOpen(true)
  }

  const handleSubmitSwapRequest = async () => {
    if (!selectedShift || !swapReason) return

    try {
      setIsSubmitting(true)
      await swapRequestsApi.createSwapRequest({
        shiftId: selectedShift.id,
        reason: swapReason,
      })

      toast({
        title: "Success",
        description: "Swap request submitted successfully.",
      })

      setIsRequestSwapDialogOpen(false)
    } catch (error) {
      console.error("Error submitting swap request:", error)
      toast({
        title: "Error",
        description: "Failed to submit swap request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }


const handleImportSchedule = async (e: React.FormEvent) => {
  e.preventDefault()

  const fileInput = document.createElement("input")
  fileInput.type = "file"
  fileInput.accept = ".csv"

  fileInput.onchange = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsedData = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      })

      if (parsedData.errors.length > 0) {
        console.error("Error parsing CSV:", parsedData.errors)
        toast({
          title: "Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        })
        return
      }

      console.log('parsedData', parsedData)
      const scheduleData = parsedData.data.map((row: any) => ({
        date: row["Date"], // or new Date(row["Date"]) if needed
        startTime: row["Start Time"],
        endTime: row["End Time"],
        role: row["Role"],
        location: row["Location"] || "N/A",
      }))

      setCsvData(scheduleData)
      console.log("Parsed Schedule Data:", scheduleData)

      // Here, you can send the scheduleData to your backend API

      toast({
        title: "Success",
        description: "Schedule imported successfully.",
      })

      // setIsImportDialogOpen(false)
    } catch (error) {
      console.error("Error importing schedule:", error)
      toast({
        title: "Error",
        description: "Failed to import schedule. Please try again.",
        variant: "destructive",
      })
    }
  }

  fileInput.click()
}

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
  
    try {
      setIsSubmitting(true)
      for( let i = 0 ; i < csvData.length; i++){ 
        await shiftsApi.importShifts(csvData[i])
      }

      toast({
        title: "Success",
        description: "Schedule imported successfully.",
      })

      setIsImportDialogOpen(false)
    } catch (error) {
      console.error("Error importing schedule:", error)
      toast({
        title: "Error",
        description: "Failed to import schedule. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
            <p className="text-muted-foreground">Import your shifts here</p>
          </div>
        </div>

        {/* {isLoading ? (
          <Card>
            <CardContent className="p-6 flex items-center justify-center h-64">
              <p>Loading shifts...</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="calendar">
            <TabsList>
              <TabsTrigger value="calendar">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="mr-2 h-4 w-4" />
                List View
              </TabsTrigger>
            </TabsList>
            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                    <div className="space-y-4">
                      <h3 className="font-medium">{date ? format(date, "MMMM d, yyyy") : "Select a date"}</h3>
                      {shiftsForSelectedDate.length > 0 ? (
                        <div className="space-y-4">
                          {shiftsForSelectedDate.map((shift) => (
                            <div key={shift.id} className="rounded-lg border p-3">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <p className="font-medium">{shift.role}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {shift.startTime} - {shift.endTime}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{shift.location}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleRequestSwap(shift)}>
                                  <ArrowUpDown className="mr-2 h-4 w-4" />
                                  Request Swap
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No shifts scheduled for this date.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Shifts</CardTitle>
                  <CardDescription>All your scheduled shifts for the next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {shifts.length > 0 ? (
                    <div className="space-y-4">
                      {shifts.map((shift) => (
                        <div key={shift.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{shift.role}</p>
                              <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                {new Date(shift.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {shift.startTime} - {shift.endTime}
                            </div>
                            <p className="text-sm text-muted-foreground">{shift.location}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleRequestSwap(shift)}>
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Request Swap
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No shifts scheduled.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )} */}

        <Card>
          {/* <CardHeader>
            <CardTitle>This Week's Schedule</CardTitle>
            <CardDescription>Import your schedule Here</CardDescription> */}
          {/* </CardHeader> */}
          <CardContent>
            <div className="flex justify-center items-center py-4 mt-4">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import Schedule/Shifts
              </Button>
            </div>
            {/* {currentWeekShifts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentWeekShifts.map((shift) => (
                  <div key={shift.id} className="rounded-lg border p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{shift.role}</p>
                        <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {new Date(shift.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {shift.startTime} - {shift.endTime}
                      </div>
                      <p className="text-sm text-muted-foreground">{shift.location}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleRequestSwap(shift)}
                      >
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Request Swap
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No shifts scheduled for this week.</p>
            )} */}
          </CardContent>
        </Card>
      </div>

      {/* Import Schedule Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Schedule</DialogTitle>
            <DialogDescription>
              Upload a CSV file with your schedule information or manually enter shifts.
            </DialogDescription>
          </DialogHeader>
          <form  className="space-y-4 py-4">
            <div onClick={(e)=>handleImportSchedule(e)} className="flex items-center justify-center border-2 border-dashed rounded-lg p-8">
              <div className="flex flex-col items-center gap-2">
                <FileUp className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Drag & drop your CSV file here</p>
                <p className="text-xs text-muted-foreground">or</p>
                <Button variant="outline" size="sm" type="button">
                  Browse Files
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>CSV file should include the following columns:</p>
              <ul className="list-disc pl-4 mt-1">
                <li>Date (YYYY-MM-DD)</li>
                <li>Start Time (HH:MM)</li>
                <li>End Time (HH:MM)</li>
                <li>Role</li>
                <li>Location (optional)</li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button  onClick={(e)=> handleCreateSchedule(e)}>Import</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request Swap Dialog */}
      {/* <Dialog open={isRequestSwapDialogOpen} onOpenChange={setIsRequestSwapDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Shift Swap</DialogTitle>
            <DialogDescription>Submit a request to swap your shift with another colleague.</DialogDescription>
          </DialogHeader>
          {selectedShift &&
            (
              <div className="space-y-4 py-4">
              <div className="rounded-lg border p-3 bg-muted/50">
                <p className="font-medium">{selectedShift.role}</p>
                <p className="text-sm">
                  {new Date(selectedShift.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm">
                  {selectedShift.startTime} - {selectedShift.endTime}
                </p>
                <p className="text-sm">{selectedShift.location}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for swap request</Label>
                <Textarea 
                  id="reason" 
                  placeholder="Please explain why you need to swap this shift..." 
                  rows={3} 
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred-dates">Preferred dates (optional)</Label>
                <Input 
                  id="preferred-dates" 
                  placeholder="e.g., May 18, May 19" 
                  value={preferredDates}
                  onChange={(e) => setPreferredDates(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If you have specific dates you'd prefer to work instead, list them here.
                </p>
              </div>
            </div>
            )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestSwapDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitSwapRequest} disabled={isSubmitting || !swapReason.trim()}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </DashboardLayout>
  )
}
