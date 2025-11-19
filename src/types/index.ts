export interface UserAvailability {
    name: string;
    dates: string[]; // ISO date strings YYYY-MM-DD
}

export interface DateVote {
    date: string;
    count: number;
    voters: string[];
}
