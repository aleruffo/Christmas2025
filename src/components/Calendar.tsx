"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    startOfWeek,
    endOfWeek
} from "date-fns";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
    selectedDates: string[];
    onToggleDate: (date: string) => void;
}

export function Calendar({ selectedDates, onToggleDate }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-lg hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isSelected = selectedDates.includes(dateStr);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isDayToday = isToday(day);

                    return (
                        <motion.button
                            key={dateStr}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onToggleDate(dateStr)}
                            className={cn(
                                "relative h-10 w-full rounded-lg flex items-center justify-center text-sm transition-all",
                                !isCurrentMonth && "text-muted-foreground/30",
                                isCurrentMonth && !isSelected && "text-foreground hover:bg-secondary",
                                isSelected && "bg-primary text-primary-foreground shadow-md shadow-primary/20",
                                isDayToday && !isSelected && "ring-1 ring-primary/50 text-primary font-semibold"
                            )}
                        >
                            {format(day, "d")}
                            {isSelected && (
                                <motion.div
                                    className="absolute -top-1 -right-1 bg-white text-primary rounded-full p-0.5 shadow-sm"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    <Check className="w-2 h-2" />
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-primary/50"></div>
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
}
