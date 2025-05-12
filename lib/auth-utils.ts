import { jwtVerify } from "jose"

export async function verifyAuth(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "Missing or invalid authorization header" }
    }

    // Extract the token
    const token = authHeader.split(" ")[1]
    if (!token) {
      return { success: false, error: "Missing token" }
    }

    try {
      // Verify the token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
      const { payload } = await jwtVerify(token, secret)

      return {
        success: true,
        user: {
          id: payload.id as string,
          name: payload.name as string,
          email: payload.email as string,
          role: payload.role as string,
        },
      }
    } catch (error) {
      return { success: false, error: "Invalid token" }
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return { success: false, error: "Internal server error" }
  }
}
