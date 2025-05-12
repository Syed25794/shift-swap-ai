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
//     const { name, email, password } = await request.json()

//     // Check if user already exists
//     if (users.some((u) => u.email === email)) {
//       return NextResponse.json({ error: "User already exists" }, { status: 400 })
//     }

//     // Create new user
//     const newUser = {
//       id: (users.length + 1).toString(),
//       name,
//       email,
//       password, // In a real app, this would be hashed
//       role: "staff", // Default role for new users
//     }

//     // Add to users array (in a real app, this would be saved to a database)
//     users.push(newUser)

//     // Create token
//     const token = jwt.sign(
//       {
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role,
//       },
//       process.env.JWT_SECRET || "your-secret-key", // In production, use a proper secret
//       { expiresIn: "7d" },
//     )

//     return NextResponse.json({
//       token,
//       user: {
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role,
//       },
//     })
//   } catch (error) {
//     console.error("Registration error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // In a real app, this should be hashed
        role: role || "staff", // Default role for new users
      },
    })

    // Create token
    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}