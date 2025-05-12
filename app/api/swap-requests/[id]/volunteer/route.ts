// import { NextResponse } from "next/server"
// import { verifyAuth } from "@/lib/auth-utils"

// // Reference to the mock data from the main route
// import { mockSwapRequests } from "../../route"

// export async function POST(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { note } = await request.json()
//     const swapRequestIndex = mockSwapRequests.findIndex((req) => req.id === params.id)

//     if (swapRequestIndex === -1) {
//       return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
//     }

//     const swapRequest = mockSwapRequests[swapRequestIndex]

//     // Check if user is trying to volunteer for their own swap request
//     if (swapRequest.userId === authResult.user.id) {
//       return NextResponse.json({ error: "Cannot volunteer for your own swap request" }, { status: 400 })
//     }

//     // Check if the swap request is still pending
//     if (swapRequest.status !== "pending") {
//       return NextResponse.json({ error: "This swap request is no longer accepting volunteers" }, { status: 400 })
//     }

//     // Create volunteer
//     const volunteer = {
//       id: `v${swapRequest.volunteers.length + 1}`,
//       userId: authResult.user.id,
//       name: authResult.user.name,
//       role: "Staff", // In a real app, this would be fetched from the database
//       note,
//       createdAt: new Date().toISOString(),
//     }

//     // Add volunteer to the swap request
//     const updatedSwapRequest = {
//       ...swapRequest,
//       volunteers: [...swapRequest.volunteers, volunteer],
//       status: "matched", // First volunteer automatically matches
//       matchedAt: new Date().toISOString(),
//     }

//     // Update in the array (in a real app, this would update the database)
//     mockSwapRequests[swapRequestIndex] = updatedSwapRequest

//     return NextResponse.json({ success: true, swapRequest: updatedSwapRequest })
//   } catch (error) {
//     console.error("Error volunteering for swap request:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { prisma} from "@/lib/prisma"



export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { note, shiftId } = await request.json()
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: params.id },
      include: { volunteers: true },
    })

    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
    }

    // Check if user is trying to volunteer for their own swap request
    if (swapRequest.userId === authResult.user.id) {
      return NextResponse.json({ error: "Cannot volunteer for your own swap request" }, { status: 400 })
    }

    // Check if the swap request is still pending
    if (swapRequest.status !== "pending") {
      return NextResponse.json({ error: "This swap request is no longer accepting volunteers" }, { status: 400 })
    }

    // Create volunteer
    const volunteer = {
      userId: authResult?.user?.id,
      name: authResult?.user?.name,
      role: authResult?.user?.role,
      shiftId: shiftId,
      createdAt: new Date(),
    }

    // Add volunteer to the swap request
    const updatedSwapRequest = await prisma.swapRequest.update({
      where: { id: params.id },
      data: {
        volunteers: {  create : volunteer},
        status: "matched", // First volunteer automatically matches
      },
    })

    return NextResponse.json({ success: true, swapRequest: updatedSwapRequest })
  } catch (error) {
    console.error("Error volunteering for swap request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}