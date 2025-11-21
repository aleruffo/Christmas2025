"use client";

import { useEffect, useState } from "react";
import { Participant } from "@/types/secret-santa";
import { Trash2 } from "lucide-react";

interface ParticipantListProps {
    currentUser: Participant | null;
}

export default function ParticipantList({ currentUser }: ParticipantListProps) {
    const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);

    const fetchParticipants = async () => {
        try {
            const res = await fetch("/api/secret-santa/participants");
            if (res.ok) {
                const data = await res.json();
                setParticipants(data);
            }
        } catch (error) {
            console.error("Failed to fetch participants", error);
        }
    };

    useEffect(() => {
        fetchParticipants();
        // Poll every 10 seconds
        const interval = setInterval(fetchParticipants, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleRemoveUser = async (targetUserId: string) => {
        if (!currentUser || !currentUser.isAdmin) return;
        if (!confirm("Are you sure you want to remove this user?")) return;

        try {
            const res = await fetch("/api/secret-santa/user", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId: currentUser.id, targetUserId }),
            });

            if (res.ok) {
                fetchParticipants();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to remove user");
            }
        } catch (error) {
            console.error("Failed to remove user", error);
        }
    };

    return (
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/30 shadow-lg text-white">
            <h3 className="text-lg font-bold mb-3 border-b border-white/20 pb-2">Participants ({participants.length})</h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {participants.map((p) => (
                    <li key={p.id} className="flex items-center justify-between space-x-2 group">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl">🎅</span>
                            <span className="font-medium">{p.name}</span>
                        </div>
                        {currentUser?.isAdmin && currentUser.id !== p.id && (
                            <button
                                onClick={() => handleRemoveUser(p.id)}
                                className="text-white/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove User"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
