import { NextResponse } from "next/server";
import { SecretSantaService } from "@/lib/secret-santa";

export async function DELETE(request: Request) {
    try {
        const { adminId, targetUserId } = await request.json();

        if (!adminId || !targetUserId) {
            return NextResponse.json({ error: "Admin ID and Target User ID are required" }, { status: 400 });
        }

        await SecretSantaService.removeUser(adminId, targetUserId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
