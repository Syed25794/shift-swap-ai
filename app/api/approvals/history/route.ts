// import { NextResponse } from "next/server"
// import { verifyAuth } from "@/lib/auth-utils"

// // Reference to the mock data from the swap-requests route
// import { mockSwapRequests } from "../../swap-requests/route"

// export async function GET(request: Request) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     // Only managers can access approval history
//     if (authResult.user.role !== "manager") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
//     }

//     const { searchParams } = new URL(request.url)
//     const role = searchParams.get("role")
//     const search = searchParams.get("search")?.toLowerCase()

//     // Get all approved or rejected swap requests
//     let approvalHistory = mockSwapRequests.filter((req) => req.status === "approved" || req.status === "rejected")

//     // Filter by role if provided
//     if (role && role !== "all") {
//       approvalHistory = approvalHistory.filter((approval) => approval.role === role)
//     }

//     // Filter by search term if provided
//     if (search) {
//       approvalHistory = approvalHistory.filter(
//         (approval) =>
//           approval.role.toLowerCase().includes(search) ||
//           approval.location.toLowerCase().includes(search) ||
//           "Staff User".toLowerCase().includes(search), // In a real app, this would search the requester's name
//       )
//     }

//     // Add requester and volunteer names for display
//     approvalHistory = approvalHistory.map((approval) => ({
//       ...approval,
//       requesterName: "Staff User", // In a real app, this would be fetched from the database
//       requesterRole: "Cashier",
//       volunteerName: approval.volunteers[0]?.name || "No volunteer",
//       volunteerRole: approval.volunteers[0]?.role || "N/A",
//       decidedAt: approval.decidedAt || new Date().toISOString(), // Mock data for decided timestamp
//     }))

//     return NextResponse.json({ approvalHistory })
//   } catch (error) {
//     console.error("Error fetching approval history:", error)
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

    // Only managers can access approval history
    if (authResult?.user?.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const approvalHistory = await prisma.swapRequest.findMany({
      where: {
        OR: [
          { status: "approved" },
          { status: "rejected" }
        ]
      },
      include: {
        volunteers: true, // Include volunteers for display
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      }
    })

    // Add requester and volunteer names for display
    const formattedHistory = approvalHistory.map((approval) => ({
      ...approval,
      requesterName: approval.user.name, // Assuming user relation exists
      requesterRole: approval.user.role, // Assuming user relation exists
      volunteerName: approval.volunteers[0]?.name || "No volunteer",
      volunteerRole: approval.volunteers[0]?.role || "N/A"
    }))

    return NextResponse.json({ approvalHistory: formattedHistory })
  } catch (error) {
    console.error("Error fetching approval history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}