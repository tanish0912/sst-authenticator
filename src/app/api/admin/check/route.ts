import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { isAdmin } from "@/middleware/auth";

export async function GET(request: Request) {
    try {
        // Authenticate the user
        const user = await authenticateUser(request);
        if (!user || !user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const adminStatus = await isAdmin(user.email);
        
        return NextResponse.json({ isAdmin: adminStatus });

    } catch (error) {
        console.error('Error checking admin status:', error);
        return NextResponse.json(
            { error: "Failed to check admin status" },
            { status: 500 }
        );
    }
}
