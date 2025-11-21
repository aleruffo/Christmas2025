import { NextResponse } from "next/server";
import { SecretSantaService } from "@/lib/secret-santa";

export async function GET() {
    try {
        const participants = await SecretSantaService.getParticipantsPublic();
        return NextResponse.json(participants);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
