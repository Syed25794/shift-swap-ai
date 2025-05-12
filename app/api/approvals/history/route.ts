import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { prisma} from "@/lib/prisma"



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