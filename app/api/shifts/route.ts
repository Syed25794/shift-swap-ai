// import { NextResponse } from "next/server"
// import { verifyAuth } from "@/lib/auth-utils"

// // Mock data for shifts
// const mockShifts = [
//   {
//     id: "1",
//     userId: "1", // Staff User
//     date: "2025-05-13",
//     startTime: "09:00",
//     endTime: "17:00",
//     role: "Cashier",
//     location: "Main Floor",
//   },
//   {
//     id: "2",
//     userId: "1", // Staff User
//     date: "2025-05-15",
//     startTime: "12:00",
//     endTime: "20:00",
//     role: "Floor Staff",
//     location: "Electronics Department",
//   },
//   {
//     id: "3",
//     userId: "1", // Staff User
//     date: "2025-05-17",
//     startTime: "08:00",
//     endTime: "16:00",
//     role: "Cashier",
//     location: "Customer Service",
//   },
//   {
//     id: "4",
//     userId: "1", // Staff User
//     date: "2025-05-20",
//     startTime: "10:00",
//     endTime: "18:00",
//     role: "Stocker",
//     location: "Warehouse",
//   },
//   {
//     id: "5",
//     userId: "1", // Staff User
//     date: "2025-05-22",
//     startTime: "14:00",
//     endTime: "22:00",
//     role: "Floor Staff",
//     location: "Home Goods Department",
//   },
//   {
//     id: "6",
//     userId: "1", // Staff User
//     date: "2025-05-24",
//     startTime: "07:00",
//     endTime: "15:00",
//     role: "Opener",
//     location: "Main Entrance",
//   },
//   {
//     id: "7",
//     userId: "1", // Staff User
//     date: "2025-05-27",
//     startTime: "15:00",
//     endTime: "23:00",
//     role: "Closer",
//     location: "All Departments",
//   },
//   // Manager shifts
//   {
//     id: "8",
//     userId: "2", // Manager User
//     date: "2025-05-14",
//     startTime: "09:00",
//     endTime: "17:00",
//     role: "Manager",
//     location: "Office",
//   },
//   {
//     id: "9",
//     userId: "2", // Manager User
//     date: "2025-05-16",
//     startTime: "09:00",
//     endTime: "17:00",
//     role: "Manager",
//     location: "Office",
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
//     const date = searchParams.get("date")
//     const startDate = searchParams.get("startDate")
//     const endDate = searchParams.get("endDate")

//     let shifts = [...mockShifts]

//     // Filter by userId if provided
//     if (userId) {
//       shifts = shifts.filter((shift) => shift.userId === userId)
//     }

//     // Filter by specific date if provided
//     if (date) {
//       shifts = shifts.filter((shift) => shift.date === date)
//     }

//     // Filter by date range if provided
//     if (startDate && endDate) {
//       shifts = shifts.filter((shift) => {
//         const shiftDate = new Date(shift.date)
//         return shiftDate >= new Date(startDate) && shiftDate <= new Date(endDate)
//       })
//     }

//     return NextResponse.json({ shifts })
//   } catch (error) {
//     console.error("Error fetching shifts:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     // Only managers can add shifts
//     if (authResult.user.role !== "manager") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
//     }

//     const shifts = await request.json()

//     // In a real app, this would save to a database
//     // For now, we'll just return success

//     return NextResponse.json({ success: true, message: "Shifts imported successfully" })
//   } catch (error) {
//     console.error("Error importing shifts:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { prisma} from '@/lib/prisma'



export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    let shifts = []
    if( status ){
      shifts = await prisma.shift.findMany({
        where: {
          userId: authResult?.user?.id,
          SwapRequest : {
            none : { status : { not: status } }
          }
        },
      })
    }else {
      shifts = await prisma.shift.findMany({
        where: {
          userId: authResult?.user?.id
        },
        include : { SwapRequest : true }
      })
    }

    return NextResponse.json({ shifts })
  } catch (error) {
    console.error("Error fetching shifts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only managers can add shifts
    // if (authResult?.user?.role !== "manager") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    const { date, startTime, endTime, role, location } = await request.json()

    const data = {
      userId: authResult?.user?.id,
      date: new Date(date),
      startTime,
      endTime,
      role,
      location,
    }
    console.log({data})
    const newShift = await prisma.shift.create({
      data : data
    })

    return NextResponse.json({ success: true, shift: newShift })
  } catch (error) {
    console.error("Error adding shift:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}