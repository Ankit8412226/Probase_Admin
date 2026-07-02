import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { signAuthToken, getAuthCookieConfig } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/http";
import { createId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { companyName, name, email, password } = body;

    if (!companyName || !name || !email || !password) {
      return apiError("Please provide all registration details.", 400);
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return apiError("User with this email already exists.", 409);
    }

    // Create unique tenant ID and User ID
    const tenantId = `tenant_${createId("org")}`;
    const userId = createId("usr");
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      _id: userId,
      tenantId,
      name,
      email: normalizedEmail,
      role: "admin" as const,
      password: hashedPassword,
    };

    // Create the User in database
    await User.create(newUser);

    const authUser = {
      id: userId,
      tenantId,
      name,
      email: normalizedEmail,
      role: "admin" as const,
    };

    const token = signAuthToken(authUser);
    const response = apiSuccess(authUser);
    response.cookies.set(getAuthCookieConfig(token));

    return response;
  } catch (error: any) {
    console.error("Signup failed:", error);
    return apiError(error.message || "Failed to register workspace.", 500);
  }
}
