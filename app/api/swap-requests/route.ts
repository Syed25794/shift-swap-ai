// import { NextResponse } from "next/server"
// import { verifyAuth } from "@/lib/auth-utils"

// // Mock data for swap requests
// const mockSwapRequests = [
//   {
//     id: "1",
//     userId: "1", // Staff User
//     shiftId: "3",
//     date: "2025-05-17",
//     startTime: "08:00",
//     endTime: "16:00",
//     role: "Cashier",
//     location: "Customer Service",
//     status: "pending",
//     reason: "Doctor's appointment",
//     volunteers: [{ id: "v1", userId: "3", name: "Alex Johnson", role: "Cashier" }],
//     createdAt: "2025-05-10T10:30:00Z",
//   },
//   {
//     id: "2",
//     userId: "1", // Staff User
//     shiftId: "4",
//     date: "2025-05-20",
//     startTime: "10:00",
//     endTime: "18:00",
//     role: "Stocker",
//     location: "Warehouse",
//     status: "pending",
//     reason: "Family event",
//     volunteers: [],
//     createdAt: "2025-05-11T14:15:00Z",
//   },
//   {
//     id: "3",
//     userId: "1", // Staff User
//     shiftId: "2",
//     date: "2025-05-15",
//     startTime: "12:00",
//     endTime: "20:00",
//     role: "Floor Staff",
//     location: "Electronics Department",
//     status: "matched",
//     reason: "Personal emergency",
//     volunteers: [{ id: "v2", userId: "4", name: "Jamie Smith", role: "Floor Staff" }],
//     createdAt: "2025-05-09T09:45:00Z",
//   },
//   {
//     id: "4",
//     userId: "1", // Staff User
//     shiftId: "5",
//     date: "2025-05-22",
//     startTime: "14:00",
//     endTime: "22:00",
//     role: "Floor Staff",
//     location: "Home Goods Department",
//     status: "approved",
//     reason: "Transportation issues",
//     volunteers: [{ id: "v3", userId: "5", name: "Taylor Wilson", role: "Floor Staff" }],
//     createdAt: "2025-05-08T16:20:00Z",
//   },
//   {
//     id: "5",
//     userId: "1", // Staff User
//     shiftId: "1",
//     date: "2025-05-10",
//     startTime: "09:00",
//     endTime: "17:00",
//     role: "Cashier",
//     location: "Main Floor",
//     status: "completed",
//     reason: "Family emergency",
//     volunteers: [{ id: "v4", userId: "6", name: "Riley Garcia", role: "Cashier" }],
//     createdAt: "2025-05-05T11:10:00Z",
//   },
// ]

// // Mock data for shifts
// const mockShifts = [
//   {
//     id: "1",
//     date: "2025-05-10",
//     startTime: "09:00",
//     endTime: "17:00",
//     role: "Cashier",
//     location: "Main Floor",
//   },
//   {
//     id: "2",
//     date: "2025-05-15",
//     startTime: "12:00",
//     endTime: "20:00",
//     role: "Floor Staff",
//     location: "Electronics Department",
//   },
//   {
//     id: "3",
//     date: "2025-05-17",
//     startTime: "08:00",
//     endTime: "16:00",
//     role: "Cashier",
//     location: "Customer Service",
//   },
//   {
//     id: "4",
//     date: "2025-05-20",
//     startTime: "10:00",
//     endTime: "18:00",
//     role: "Stocker",
//     location: "Warehouse",
//   },
//   {
//     id: "5",
//     date: "2025-05-22",
//     startTime: "14:00",
//     endTime: "22:00",
//     role: "Floor Staff",
//     location: "Home Goods Department",
//   },
// ]

// export async function GET(request: Request) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const userId = searchParams.get("userId")
//     const status = searchParams.get("status")
//     const isManager = authResult.user.role === "manager"

//     let swapRequests = [...mockSwapRequests]

//     // Filter by userId if provided and not a manager
//     if (userId && !isManager) {
//       swapRequests = swapRequests.filter((req) => req.userId === userId)
//     }

//     // Filter by status if provided
//     if (status) {
//       const statuses = status.split(",")
//       swapRequests = swapRequests.filter((req) => statuses.includes(req.status))
//     }

//     // Add requester name for display
//     swapRequests = swapRequests.map((req) => ({
//       ...req,
//       requesterName: "Staff User", // In a real app, this would be fetched from the database
//       requesterRole: "Cashier",
//     }))

//     return NextResponse.json({ swapRequests })
//   } catch (error) {
//     console.error("Error fetching swap requests:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { shiftId, reason } = await request.json()

//     // Find the shift
//     const shift = mockShifts.find((s) => s.id === shiftId)
//     if (!shift) {
//       return NextResponse.json({ error: "Shift not found" }, { status: 404 })
//     }

//     // Create new swap request
//     const newSwapRequest = {
//       id: (mockSwapRequests.length + 1).toString(),
//       userId: authResult.user.id,
//       shiftId,
//       date: shift.date,
//       startTime: shift.startTime,
//       endTime: shift.endTime,
//       role: shift.role,
//       location: shift.location,
//       status: "pending",
//       reason,
//       volunteers: [],
//       createdAt: new Date().toISOString(),
//     }

//     // Add to swap requests (in a real app, this would be saved to a database)
//     mockSwapRequests.push(newSwapRequest)

//     return NextResponse.json({ success: true, swapRequest: newSwapRequest })
//   } catch (error) {
//     console.error("Error creating swap request:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { prisma} from "@/lib/prisma"



export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")
    let swapRequests = []
    if( status ){
      // Build the query for swap requests
      swapRequests = await prisma.swapRequest.findMany({
        where: {
          ...(userId ? { userId } : {}),
          ...(status ? { status } : {}),
        },
        include: {
          volunteers: true, // Include volunteers in the response
        },
      })
    }else{
      // Build the query for swap requests
      swapRequests = await prisma.swapRequest.findMany({
        where: {
          ...(userId ? { userId } : {}),
        },
        include: {
          volunteers: true, // Include volunteers in the response
        },
      })
    }

   const pendingSwap = swapRequests.filter((swapRequest) => swapRequest.status === "pending")
   const openSwap = swapRequests.filter((swapRequest) => swapRequest.status === "pending" && swapRequest.userId !== authResult?.user?.id)
   const completedSwap = swapRequests.filter((swapRequest) => swapRequest.status === "approved")

   console.log("Pending Swap Requests:", pendingSwap, openSwap, completedSwap)
    return NextResponse.json({ swapRequests, pendingSwap, openSwap, completedSwap })
  } catch (error) {
    console.error("Error fetching swap requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shiftId, reason } = await request.json()

    const shift = await prisma.shift.findUnique({ where : { id : shiftId }})

    if( !shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 })
    }
    // Check if the user is eligible to create a swap request for this shift    
    if (shift.userId !== authResult?.user?.id) {
      return NextResponse.json({ error: "You are not authorized to create a swap request for this shift" }, { status: 403 })
    }

    // Create a new swap request
    const newSwapRequest = await prisma.swapRequest.create({
      data: {
        userId: authResult?.user?.id,
        shiftId,
        startTime: shift.startTime,
        endTime: shift.endTime,
        role: shift.role,
        location: shift.location,
        reason,
        status: "pending",
        date: new Date(), // Assuming the date is the current date
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, swapRequest: newSwapRequest })
  } catch (error) {
    console.error("Error creating swap request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}