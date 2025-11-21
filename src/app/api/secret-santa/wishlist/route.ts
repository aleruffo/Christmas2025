import { NextResponse } from "next/server";
import { SecretSantaService } from "@/lib/secret-santa";

export async function POST(request: Request) {
    try {
        const { userId, wishlist } = await request.json();

        if (!userId || wishlist === undefined) {
            return NextResponse.json({ error: "User ID and wishlist are required" }, { status: 400 });
        }

        const user = await SecretSantaService.updateWishlist(userId, wishlist);
        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
