// import { NextResponse } from "next/server"
// import { verifyAuth } from "@/lib/auth-utils"

// // Reference to the mock data from the swap-requests route
// import { mockSwapRequests } from "../swap-requests/route"

// export async function GET(request: Request) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     // Only managers can access approvals
//     if (authResult.user.role !== "manager") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
//     }

//     const { searchParams } = new URL(request.url)
//     const status = searchParams.get("status")
//     const role = searchParams.get("role")
//     const search = searchParams.get("search")?.toLowerCase()

//     // Get all matched swap requests for managers to approve
//     let approvals = [...mockSwapRequests]

//     // Filter by status if provided
//     if (status) {
//       const statuses = status.split(",")
//       approvals = approvals.filter((req) => statuses.includes(req.status))
//     } else {
//       // Default to matched requests if no status provided
//       approvals = approvals.filter((req) => req.status === "matched")
//     }

//     // Filter by role if provided
//     if (role && role !== "all") {
//       approvals = approvals.filter((approval) => approval.role === role)
//     }

//     // Filter by search term if provided
//     if (search) {
//       approvals = approvals.filter(
//         (approval) =>
//           approval.role.toLowerCase().includes(search) ||
//           approval.location.toLowerCase().includes(search) ||
//           "Staff User".toLowerCase().includes(search), // In a real app, this would search the requester's name
//       )
//     }

//     // Add requester and volunteer names for display
//     approvals = approvals.map((approval) => ({
//       ...approval,
//       requesterName: "Staff User", // In a real app, this would be fetched from the database
//       requesterRole: "Cashier",
//       volunteerName: approval.volunteers[0]?.name || "No volunteer yet",
//       volunteerRole: approval.volunteers[0]?.role || "N/A",
//     }))

//     return NextResponse.json({ approvals })
//   } catch (error) {
//     console.error("Error fetching approvals:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only managers can access approvals
    if (authResult?.user?.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    // const role = searchParams.get("role")
    // const search = searchParams.get("search")?.toLowerCase()

    // Get all matched swap requests for managers to approve
    let approvals = await prisma.swapRequest.findMany({
      where: {
        status: "matched",
      },
      include: {
        volunteers: true,
        user: true
      }
    })
    console.log("approvals", approvals)

    // Filter by role if provided
    // if (role && role !== "all") {
    //   approvals = approvals.filter((approval) => approval.role === role)
    // }

    // // Filter by search term if provided
    // if (search) {
    //   approvals = approvals.filter(
    //     (approval) =>
    //       approval.role.toLowerCase().includes(search) ||
    //       approval.location.toLowerCase().includes(search) ||
    //       approval.user.name.toLowerCase().includes(search) // Assuming user is related to swapRequest
    //   )
    // }

    // Add requester and volunteer names for display
    approvals = approvals.map((approval) => ({
      ...approval,
      requesterName: approval.user.name, // Assuming user is related to swapRequest
      requesterRole: approval.user.role, // Assuming user is related to swapRequest
      volunteerName: approval.volunteers[0]?.name || "No volunteer yet",
      volunteerRole: approval.volunteers[0]?.role || "N/A",
    }))

    return NextResponse.json({ approvals })
  } catch (error) {
    console.error("Error fetching approvals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
