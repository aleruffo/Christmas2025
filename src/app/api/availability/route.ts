import { NextResponse } from "next/server";
import { DateVote } from "@/types";
import { kv } from "@vercel/kv";

const KV_KEY = "availability_votes";

export async function GET() {
    try {
        const votes = await kv.get<DateVote[]>(KV_KEY);
        return NextResponse.json(votes || []);
    } catch (error) {
        console.error("KV Error", error);
        // Fallback to empty array if KV fails (e.g. missing env vars locally)
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, dates } = body;

        if (!name || !Array.isArray(dates)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const currentVotes = (await kv.get<DateVote[]>(KV_KEY)) || [];

        // Reconstruct the Map-like structure for easier manipulation
        // Map<DateString, Set<UserName>>
        const voteMap = new Map<string, Set<string>>();

        // Populate map from current data
        currentVotes.forEach(v => {
            voteMap.set(v.date, new Set(v.voters));
        });

        // Remove user from ALL dates first (to handle updates/unchecking)
        voteMap.forEach((voters) => {
            voters.delete(name);
        });

        // Add user to the new selected dates
        dates.forEach((date: string) => {
            if (!voteMap.has(date)) {
                voteMap.set(date, new Set());
            }
            voteMap.get(date)?.add(name);
        });

        // Convert back to array for storage
        const newVotes: DateVote[] = [];
        voteMap.forEach((voters, date) => {
            if (voters.size > 0) {
                newVotes.push({
                    date,
                    count: voters.size,
                    voters: Array.from(voters)
                });
            }
        });

        await kv.set(KV_KEY, newVotes);

        return NextResponse.json(newVotes);
    } catch (error) {
        console.error("API Error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
