// import { NextResponse } from "next/server"
// import jwt from "jsonwebtoken"

// // In a real app, this would be in a database
// const users = [
//   {
//     id: "1",
//     name: "Staff User",
//     email: "staff@example.com",
//     password: "password", // In a real app, this would be hashed
//     role: "staff",
//   },
//   {
//     id: "2",
//     name: "Manager User",
//     email: "manager@example.com",
//     password: "password", // In a real app, this would be hashed
//     role: "manager",
//   },
// ]

// export async function POST(request: Request) {
//   try {
//     const { email, password } = await request.json()

//     // Find user
//     const user = users.find((u) => u.email === email)
//     if (!user || user.password !== password) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     // Create token
//     const token = jwt.sign(
//       {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       process.env.JWT_SECRET || "your-secret-key", // In production, use a proper secret
//       { expiresIn: "7d" },
//     )

//     return NextResponse.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     })
//   } catch (error) {
//     console.error("Login error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma} from "@/lib/prisma"



export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
