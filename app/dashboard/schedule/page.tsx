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
  const [fileName, setFileName] = useState<string | null>(null) // State to store the file name

  const handleImportSchedule = async (e: React.FormEvent) => {
    e.preventDefault()

    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".csv"

    fileInput.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      setFileName(file.name) // Set the file name when a file is selected

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

        const scheduleData = parsedData.data.map((row: any) => ({
          date: row["Date"],
          startTime: row["Start Time"],
          endTime: row["End Time"],
          role: row["Role"],
          location: row["Location"] || "N/A",
        }))

        setCsvData(scheduleData)
        toast({
          title: "Success",
          description: "File parsed successfully. Ready to import.",
        })
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
      setIsSubmitting(true) // Show loading state
      for (let i = 0; i < csvData.length; i++) {
        await shiftsApi.importShifts(csvData[i])
      }

      toast({
        title: "Success",
        description: "Schedule imported successfully.",
      })

      setIsImportDialogOpen(false)
      setFileName(null) // Reset the file name after successful import
    } catch (error) {
      console.error("Error importing schedule:", error)
      toast({
        title: "Error",
        description: "Failed to import schedule. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false) // Hide loading state
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="flex justify-center items-center py-4 mt-4">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import Schedule/Shifts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import Schedule Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Schedule</DialogTitle>
              <DialogDescription>
                Upload a CSV file with your schedule information or manually enter shifts.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4 py-4">
              <div
                onClick={(e) => handleImportSchedule(e)}
                className="flex items-center justify-center border-2 border-dashed rounded-lg p-8"
              >
                <div className="flex flex-col items-center gap-2">
                  <FileUp className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Browse your CSV file here</p>
                  {fileName && <p className="text-xs text-muted-foreground">Selected File: {fileName}</p>}
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
                <Button onClick={(e) => handleCreateSchedule(e)} disabled={isSubmitting}>
                  {isSubmitting ? "Importing..." : "Import"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
