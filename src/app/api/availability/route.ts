import { NextResponse } from "next/server";
import { DateVote } from "@/types";

// In-memory storage
// Map<dateString, Set<userName>>
const votes = new Map<string, Set<string>>();

export async function GET() {
    const result: DateVote[] = [];

    votes.forEach((voters, date) => {
        result.push({
            date,
            count: voters.size,
            voters: Array.from(voters)
        });
    });

    return NextResponse.json(result);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, dates } = body;

        if (!name || !Array.isArray(dates)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Remove user from all dates first (to handle updates/unchecking)
        // Actually, for simplicity, let's assume the client sends the full list of *current* available dates for this user.
        // But since we don't track per-user state easily without a DB, we'll just add them to the new dates.
        // To do it properly in-memory: we need to know what they selected before? 
        // Or we can just say: this endpoint adds availability.
        // Let's make it simple: The user submits their *entire* availability.
        // We need to clear their previous votes? That's hard without a user ID or storing per user.
        // Let's store: Map<UserName, Set<Date>> as well?

        // Better approach for this demo:
        // Global state: Map<Date, Set<Name>>
        // When user submits: 
        // We iterate all dates in the map, remove user from them.
        // Then add user to the new dates.

        votes.forEach((voters) => {
            voters.delete(name);
        });

        dates.forEach((date: string) => {
            if (!votes.has(date)) {
                votes.set(date, new Set());
            }
            votes.get(date)?.add(name);
        });

        // Return updated votes
        const result: DateVote[] = [];
        votes.forEach((voters, date) => {
            if (voters.size > 0) {
                result.push({
                    date,
                    count: voters.size,
                    voters: Array.from(voters)
                });
            }
        });

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
