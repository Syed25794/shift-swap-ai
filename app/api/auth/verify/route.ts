// import { NextResponse } from "next/server"
// import jwt from "jsonwebtoken"

// export async function POST(request: Request) {
//   try {
//     const { token } = await request.json()

//     if (!token) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 })
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
//       return NextResponse.json({ valid: true, user: decoded })
//     } catch (error) {
//       return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 401 })
//     }
//   } catch (error) {
//     console.error("Token verification error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma} from "@/lib/prisma"



export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
      console.log({decoded})

      // Fetch user from the database to ensure they exist
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      })

      if (!user) {
        return NextResponse.json({ valid: false, error: "User not found" }, { status: 401 })
      }

      return NextResponse.json({ valid: true, user: decoded })
    } catch (error) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}