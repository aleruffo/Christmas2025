import { NextResponse } from "next/server";
import { SecretSantaService } from "@/lib/secret-santa";

export async function POST(request: Request) {
    try {
        const { name, password } = await request.json();

        if (!name || !password) {
            return NextResponse.json({ error: "Name and password are required" }, { status: 400 });
        }

        const user = await SecretSantaService.registerUser(name, password);
        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
