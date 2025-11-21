import { redis } from "./redis";
import { Participant } from "@/types/secret-santa";
import { v4 as uuidv4 } from "uuid";

const PARTICIPANTS_KEY = "secret-santa:participants";
const STATE_KEY = "secret-santa:state";

export const SecretSantaService = {
    async getParticipant(username: string): Promise<Participant | null> {
        const id = await redis.hget("secret-santa:usernames", username);
        if (!id) return null;
        const data = await redis.hget(PARTICIPANTS_KEY, id);
        return data ? JSON.parse(data) : null;
    },

    async getParticipantById(id: string): Promise<Participant | null> {
        const data = await redis.hget(PARTICIPANTS_KEY, id);
        return data ? JSON.parse(data) : null;
    },

    async registerUser(name: string, password: string): Promise<Participant> {
        const existing = await this.getParticipant(name);
        if (existing) {
            throw new Error("User already exists");
        }

        const count = await redis.hlen(PARTICIPANTS_KEY);
        const isAdmin = count === 0;

        const newParticipant: Participant = {
            id: uuidv4(),
            name,
            password, // In a real app, hash this!
            wishlist: [],
            targetId: null,
            isAdmin,
        };

        await redis.hset(PARTICIPANTS_KEY, newParticipant.id, JSON.stringify(newParticipant));
        await redis.hset("secret-santa:usernames", name, newParticipant.id);

        return newParticipant;
    },

    async loginUser(name: string, password: string): Promise<Participant | null> {
        const user = await this.getParticipant(name);
        if (user && user.password === password) {
            return user;
        }
        return null;
    },

    async updateWishlist(userId: string, wishlist: any[]): Promise<Participant> {
        const user = await this.getParticipantById(userId);
        if (!user) throw new Error("User not found");

        user.wishlist = wishlist;
        await redis.hset(PARTICIPANTS_KEY, user.id, JSON.stringify(user));
        return user;
    },

    async getParticipantsPublic(): Promise<{ id: string; name: string }[]> {
        const participants = await this.getAllParticipants();
        return participants.map((p) => ({ id: p.id, name: p.name }));
    },

    async removeUser(adminId: string, targetUserId: string): Promise<void> {
        const admin = await this.getParticipantById(adminId);
        if (!admin || !admin.isAdmin) {
            throw new Error("Unauthorized");
        }

        const targetUser = await this.getParticipantById(targetUserId);
        if (!targetUser) {
            throw new Error("User not found");
        }

        await redis.hdel(PARTICIPANTS_KEY, targetUserId);
        await redis.hdel("secret-santa:usernames", targetUser.name);
    },

    async getAllParticipants(): Promise<Participant[]> {
        const data = await redis.hvals(PARTICIPANTS_KEY);
        return data.map((d) => JSON.parse(d));
    },

    async runRaffle(): Promise<void> {
        const participants = await this.getAllParticipants();
        if (participants.length < 2) {
            throw new Error("Not enough participants to run raffle");
        }

        // Shuffle
        const shuffled = [...participants];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Assign targets in a circular linked list fashion to ensure derangement
        // p[0] -> p[1] -> ... -> p[n] -> p[0]
        for (let i = 0; i < shuffled.length; i++) {
            const current = shuffled[i];
            const target = shuffled[(i + 1) % shuffled.length];
            current.targetId = target.id;
        }

        // Save all
        const pipeline = redis.pipeline();
        for (const p of shuffled) {
            pipeline.hset(PARTICIPANTS_KEY, p.id, JSON.stringify(p));
        }
        await pipeline.exec();

        await redis.set(STATE_KEY, "done");
    },

    async isRaffleDone(): Promise<boolean> {
        const state = await redis.get(STATE_KEY);
        return state === "done";
    },
};
