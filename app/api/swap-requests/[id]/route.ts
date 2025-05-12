// import { NextResponse } from "next/server"
// import { verifyAuth } from "@/lib/auth-utils"

// // Reference to the mock data from the main route
// import { mockSwapRequests } from "../route"

// export async function GET(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const swapRequest = mockSwapRequests.find((req) => req.id === params.id)
//     if (!swapRequest) {
//       return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
//     }

//     // Check if user is authorized to view this swap request
//     if (authResult.user.role !== "manager" && swapRequest.userId !== authResult.user.id) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
//     }

//     // Add requester name for display
//     const swapRequestWithName = {
//       ...swapRequest,
//       requesterName: "Staff User", // In a real app, this would be fetched from the database
//       requesterRole: "Cashier",
//     }

//     return NextResponse.json({ swapRequest: swapRequestWithName })
//   } catch (error) {
//     console.error("Error fetching swap request:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function PUT(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { status, reason } = await request.json()
//     const swapRequestIndex = mockSwapRequests.findIndex((req) => req.id === params.id)

//     if (swapRequestIndex === -1) {
//       return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
//     }

//     // Check if user is authorized to update this swap request
//     const swapRequest = mockSwapRequests[swapRequestIndex]
//     if (authResult.user.role !== "manager" && swapRequest.userId !== authResult.user.id) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
//     }

//     // Update swap request
//     const updatedSwapRequest = {
//       ...swapRequest,
//       status: status || swapRequest.status,
//     }

//     if (status === "rejected" && reason) {
//       updatedSwapRequest.rejectionReason = reason
//     }

//     if (status === "approved" || status === "rejected") {
//       updatedSwapRequest.decidedAt = new Date().toISOString()
//     }

//     // Update in the array (in a real app, this would update the database)
//     mockSwapRequests[swapRequestIndex] = updatedSwapRequest

//     return NextResponse.json({ success: true, swapRequest: updatedSwapRequest })
//   } catch (error) {
//     console.error("Error updating swap request:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const swapRequestIndex = mockSwapRequests.findIndex((req) => req.id === params.id)

//     if (swapRequestIndex === -1) {
//       return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
//     }

//     // Check if user is authorized to delete this swap request
//     const swapRequest = mockSwapRequests[swapRequestIndex]
//     if (authResult.user.role !== "manager" && swapRequest.userId !== authResult.user.id) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
//     }

//     // Remove from the array (in a real app, this would delete from the database)
//     mockSwapRequests.splice(swapRequestIndex, 1)

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error("Error deleting swap request:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { prisma} from "@/lib/prisma"



export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: params.id },
      include: {
        volunteers: true, // Include volunteers if needed
      },
    })

    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
    }

    // Check if user is authorized to view this swap request
    if (authResult?.user?.role !== "manager" && swapRequest.userId !== authResult?.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ swapRequest })
  } catch (error) {
    console.error("Error fetching swap request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, reason } = await request.json()
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: params.id },
    })

    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
    }

    // Check if user is authorized to update this swap request
    if (authResult?.user?.role !== "manager" && swapRequest.userId !== authResult?.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedSwapRequest = await prisma.swapRequest.update({
      where: { id: params.id },
      data: {
        status: status || swapRequest.status
        // ...(status === "rejected" && reason ? { rejectionReason: reason } : {}),
        // ...(status === "approved" || status === "rejected" ? { decidedAt: new Date() } : {}),
      },
    })

    return NextResponse.json({ success: true, swapRequest: updatedSwapRequest })
  } catch (error) {
    console.error("Error updating swap request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: params.id },
    })

    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
    }

    // Check if user is authorized to delete this swap request
    if (authResult?.user?.role !== "manager" && swapRequest.userId !== authResult?.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.swapRequest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting swap request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}