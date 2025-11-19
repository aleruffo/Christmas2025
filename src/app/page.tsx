"use client";

import { useState, useEffect } from "react";
import { UserEntry } from "@/components/UserEntry";
import { Calendar } from "@/components/Calendar";
import { Ranking } from "@/components/Ranking";
import { DateVote } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [name, setName] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [votes, setVotes] = useState<DateVote[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial votes and check local storage
  useEffect(() => {
    const init = async () => {
      const data = await fetchVotes();
      const savedName = localStorage.getItem("userName");
      if (savedName) {
        setName(savedName);
        if (data) {
          const userDates = data
            .filter((v: DateVote) => v.voters.includes(savedName))
            .map((v: DateVote) => v.date);
          setSelectedDates(userDates);
        }
      }
    };
    init();
  }, []);

  const fetchVotes = async () => {
    try {
      const res = await fetch("/api/availability");
      if (res.ok) {
        const data = await res.json();
        setVotes(data);
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch votes", error);
    } finally {
      setLoading(false);
    }
    return [];
  };

  const handleJoin = (userName: string) => {
    setName(userName);
    localStorage.setItem("userName", userName);
    // For manual join, votes state should already be populated
    const userDates = votes
      .filter(v => v.voters.includes(userName))
      .map(v => v.date);
    setSelectedDates(userDates);
  };

  const handleToggleDate = async (date: string) => {
    if (!name) return;

    const newDates = selectedDates.includes(date)
      ? selectedDates.filter(d => d !== date)
      : [...selectedDates, date];

    setSelectedDates(newDates);

    // Optimistic update? Or just wait for server?
    // Let's send to server immediately
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dates: newDates }),
      });

      if (res.ok) {
        const updatedVotes = await res.json();
        setVotes(updatedVotes);
      }
    } catch (error) {
      console.error("Failed to update availability", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-4 tracking-tight">
            Availability Check
          </h1>
          <p className="text-muted-foreground text-lg">
            Find the best day for everyone.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {!name ? (
            <UserEntry key="entry" onJoin={handleJoin} />
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-8 items-start"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-semibold">
                    Hi, <span className="text-primary">{name}</span>!
                  </h2>
                  <button
                    onClick={() => {
                      setName(null);
                      localStorage.removeItem("userName");
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Change Name
                  </button>
                </div>
                <Calendar
                  selectedDates={selectedDates}
                  onToggleDate={handleToggleDate}
                />
                <p className="text-center text-sm text-muted-foreground">
                  Tap dates to toggle availability.
                </p>
              </div>

              <div>
                <Ranking votes={votes} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
