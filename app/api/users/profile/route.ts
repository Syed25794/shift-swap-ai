// import { NextResponse } from "next/server"
// import { verifyAuth } from "@/lib/auth-utils"

// export async function GET(request: Request) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     // Mock user profile data
//     const userProfile = {
//       id: authResult?.user?.id,
//       name: authResult?.user?.name,
//       email: authResult?.user?.email,
//       role: authResult?.user?.role,
//       phone: "555-123-4567", // Mock data
//       department: authResult?.user?.role === "manager" ? "Management" : "Operations", // Mock data
//       position: authResult?.user?.role === "manager" ? "Manager" : "Staff",
//       bio: "Experienced retail professional with 5+ years in customer service.", // Mock data
//     }

//     return NextResponse.json({ profile: userProfile })
//   } catch (error) {
//     console.error("Error fetching user profile:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     const authResult = await verifyAuth(request)
//     if (!authResult.success) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const updatedProfile = await request.json()

//     // In a real app, this would update the user profile in the database
//     // For now, we'll just return success

//     return NextResponse.json({
//       success: true,
//       message: "Profile updated successfully",
//       profile: {
//         ...updatedProfile,
//         id: authResult?.user?.id,
//         role: authResult?.user?.role, // Don't allow changing role
//       },
//     })
//   } catch (error) {
//     console.error("Error updating user profile:", error)
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

    const userId = authResult?.user?.id

    // Fetch user profile data from the database
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ profile: userProfile })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = authResult?.user?.id
    const updatedProfileData = await request.json()

    // Update user profile in the database
    const updatedProfile = await prisma.user.update({
      where: { id: userId },
      data: {
        name: updatedProfileData.name,
        email: updatedProfileData.email,
        phone: updatedProfileData.phone,
        department: updatedProfileData.department,
        position: updatedProfileData.position,
        bio: updatedProfileData.bio,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}