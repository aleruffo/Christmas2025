import { NextResponse } from "next/server";
import { DateVote } from "@/types";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "votes.json");

// Helper to ensure data directory and file exist
async function ensureDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            await fs.writeFile(DATA_FILE, JSON.stringify([]), "utf-8");
        } catch (error) {
            console.error("Failed to initialize data file", error);
        }
    }
}

// Helper to read votes
async function readVotes(): Promise<DateVote[]> {
    await ensureDataFile();
    try {
        const data = await fs.readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Failed to read votes", error);
        return [];
    }
}

// Helper to write votes
async function writeVotes(votes: DateVote[]) {
    await ensureDataFile();
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(votes, null, 2), "utf-8");
    } catch (error) {
        console.error("Failed to write votes", error);
    }
}

export async function GET() {
    const votes = await readVotes();
    return NextResponse.json(votes);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, dates } = body;

        if (!name || !Array.isArray(dates)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const currentVotes = await readVotes();

        // Reconstruct the Map-like structure for easier manipulation
        // Map<DateString, Set<UserName>>
        const voteMap = new Map<string, Set<string>>();

        // Populate map from current file data
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

        await writeVotes(newVotes);

        return NextResponse.json(newVotes);
    } catch (error) {
        console.error("API Error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
