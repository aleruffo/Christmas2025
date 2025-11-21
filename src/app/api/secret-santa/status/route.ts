import { NextResponse } from "next/server";
import { SecretSantaService } from "@/lib/secret-santa";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        const isRaffleDone = await SecretSantaService.isRaffleDone();
        let user = null;
        let target = null;

        if (userId) {
            user = await SecretSantaService.getParticipantById(userId);
            if (user && user.targetId) {
                target = await SecretSantaService.getParticipantById(user.targetId);
            }
        }

        return NextResponse.json({
            isRaffleDone,
            user,
            target: target ? { name: target.name, wishlist: target.wishlist } : null,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
