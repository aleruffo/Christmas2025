"use client";

import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { DateVote } from "@/types";
import { cn } from "@/lib/utils";

interface RankingProps {
    votes: DateVote[];
}

export function Ranking({ votes }: RankingProps) {
    const maxVotes = Math.max(...votes.map((v) => v.count), 0);
    const sortedVotes = [...votes].sort((a, b) => b.count - a.count).slice(0, 5); // Top 5

    if (votes.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                No votes yet. Be the first!
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mt-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-xl">🏆</span> Top Dates
            </h3>

            <div className="space-y-4">
                {sortedVotes.map((vote, index) => (
                    <motion.div
                        key={vote.date}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        <div className="flex items-center justify-between mb-1 text-sm">
                            <span className="font-medium">
                                {format(parseISO(vote.date), "EEE, MMM d")}
                            </span>
                            <span className="text-muted-foreground">
                                {vote.count} {vote.count === 1 ? "vote" : "votes"}
                            </span>
                        </div>

                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(vote.count / maxVotes) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                    "h-full rounded-full",
                                    index === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                                        index === 1 ? "bg-gradient-to-r from-slate-300 to-slate-400" :
                                            index === 2 ? "bg-gradient-to-r from-amber-600 to-amber-700" :
                                                "bg-primary/50"
                                )}
                            />
                        </div>

                        {index === 0 && (
                            <>
                                <div className="absolute -right-2 -top-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full font-bold shadow-sm transform rotate-12 border border-yellow-200">
                                    #1
                                </div>
                                {vote.voters.length > 0 && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">Voters:</span> {vote.voters.join(", ")}
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
