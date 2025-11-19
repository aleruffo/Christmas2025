import { NextResponse } from "next/server";
import { DateVote } from "@/types";
import { redis } from "@/lib/redis";

export async function GET() {
    try {
        // Get all dates that have at least one vote
        const dates = await redis.smembers("availability:dates");

        if (!dates || dates.length === 0) {
            return NextResponse.json([]);
        }

        // Create a pipeline to get voters for all dates in one go
        const pipeline = redis.pipeline();
        dates.forEach(date => {
            pipeline.smembers(`availability:date:${date}`);
        });

        const results = await pipeline.exec();

        if (!results) {
            return NextResponse.json([]);
        }

        const votes: DateVote[] = dates.map((date, index) => {
            // ioredis pipeline results are [error, result] tuples
            const [err, voters] = results[index];
            if (err) {
                console.error(`Error fetching voters for ${date}`, err);
                return null;
            }
            return {
                date,
                count: (voters as string[]).length,
                voters: (voters as string[])
            };
        }).filter((v): v is DateVote => v !== null && v.count > 0);

        return NextResponse.json(votes);
    } catch (error) {
        console.error("Redis Error", error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, date, action } = body;

        if (!name || !date || !['add', 'remove'].includes(action)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const dateKey = `availability:date:${date}`;
        const datesKey = "availability:dates";

        if (action === 'add') {
            await redis.sadd(dateKey, name);
            await redis.sadd(datesKey, date);
        } else {
            await redis.srem(dateKey, name);
            // Check if any voters remain, if not remove date from index
            const count = await redis.scard(dateKey);
            if (count === 0) {
                await redis.srem(datesKey, date);
            }
        }

        // Return updated votes for this specific date to keep client in sync
        const voters = await redis.smembers(dateKey);

        return NextResponse.json({
            date,
            count: voters.length,
            voters
        });
    } catch (error) {
        console.error("API Error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
