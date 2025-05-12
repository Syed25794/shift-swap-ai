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

//     const { searchParams } = new URL(request.url)
//     const role = searchParams.get("role")
//     const search = searchParams.get("search")?.toLowerCase()

//     // Get all pending swap requests that are not from the current user
//     let openSwaps = mockSwapRequests.filter((req) => req.status === "pending" && req.userId !== authResult.user.id)

//     // Filter by role if provided
//     if (role && role !== "all") {
//       openSwaps = openSwaps.filter((swap) => swap.role === role)
//     }

//     // Filter by search term if provided
//     if (search) {
//       openSwaps = openSwaps.filter(
//         (swap) =>
//           swap.role.toLowerCase().includes(search) ||
//           swap.location.toLowerCase().includes(search) ||
//           "Staff User".toLowerCase().includes(search), // In a real app, this would search the requester's name
//       )
//     }

//     // Add requester name for display
//     openSwaps = openSwaps.map((swap) => ({
//       ...swap,
//       requesterName: "Staff User", // In a real app, this would be fetched from the database
//       requesterRole: "Cashier",
//     }))

//     return NextResponse.json({ openSwaps })
//   } catch (error) {
//     console.error("Error fetching open swaps:", error)
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

    // const { searchParams } = new URL(request.url)
    // const role = searchParams.get("role")
    // const search = searchParams.get("search")?.toLowerCase()

    // Get all pending swap requests that are not from the current user
    const openSwaps = await prisma.swapRequest.findMany({
      where: {
        status: "pending",
        userId: {
          not: authResult?.user?.id,
        },
        // ...(role && role !== "all" ? { role } : {}),
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    })

    // // Filter by search term if provided
    // const filteredSwaps = openSwaps.filter((swap) => {
    //   const requesterName = swap.user.name.toLowerCase()
    //   const location = swap.location.toLowerCase()
    //   return (
    //     requesterName.includes(search) ||
    //     location.includes(search)
    //   )
    // })

    return NextResponse.json({ openSwaps })
  } catch (error) {
    console.error("Error fetching open swaps:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}