"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserEntryProps {
    onJoin: (name: string) => void;
}

export function UserEntry({ onJoin }: UserEntryProps) {
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onJoin(name.trim());
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Welcome!
                </h2>
                <p className="text-muted-foreground text-center mb-6">
                    Enter your name to start marking your availability.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className={cn(
                                "w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50",
                                "text-lg text-center font-medium"
                            )}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className={cn(
                            "w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2",
                            name.trim()
                                ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        Start
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
