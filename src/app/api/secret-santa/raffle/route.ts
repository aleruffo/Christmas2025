import { NextResponse } from "next/server";
import { SecretSantaService } from "@/lib/secret-santa";

export async function POST(request: Request) {
    try {
        const { adminId } = await request.json();

        if (!adminId) {
            return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
        }

        const admin = await SecretSantaService.getParticipantById(adminId);
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await SecretSantaService.runRaffle();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
