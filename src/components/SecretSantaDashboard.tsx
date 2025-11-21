"use client";

import { useState, useEffect } from "react";
import { Participant, WishlistItem } from "@/types/secret-santa";
import { motion, AnimatePresence } from "framer-motion";
import SnowEffect from "./SnowEffect";
import ParticipantList from "./ParticipantList";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, Link as LinkIcon, Gift } from "lucide-react";

export default function SecretSantaDashboard() {
    const [user, setUser] = useState<Participant | null>(null);
    const [isRaffleDone, setIsRaffleDone] = useState(false);
    const [target, setTarget] = useState<{ name: string; wishlist: WishlistItem[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Login/Register State
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    // Wishlist State
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [newItemName, setNewItemName] = useState("");
    const [newItemUrl, setNewItemUrl] = useState("");

    useEffect(() => {
        if (user) {
            fetchStatus();
        }
    }, [user]);

    const fetchStatus = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/secret-santa/status?userId=${user.id}`);
            const data = await res.json();
            setIsRaffleDone(data.isRaffleDone);
            if (data.target) {
                setTarget(data.target);
            }
            if (data.user) {
                // Handle legacy string wishlist if necessary, or assume array
                const w = Array.isArray(data.user.wishlist) ? data.user.wishlist : [];
                setWishlist(w);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const endpoint = isRegistering ? "/api/secret-santa/register" : "/api/secret-santa/login";

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setUser(data);
            setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        if (!newItemName.trim()) return;
        const newItem: WishlistItem = {
            id: uuidv4(),
            name: newItemName,
            url: newItemUrl,
        };
        const updatedWishlist = [...wishlist, newItem];
        setWishlist(updatedWishlist);
        setNewItemName("");
        setNewItemUrl("");
        saveWishlist(updatedWishlist);
    };

    const handleRemoveItem = (id: string) => {
        const updatedWishlist = wishlist.filter((item) => item.id !== id);
        setWishlist(updatedWishlist);
        saveWishlist(updatedWishlist);
    };

    const saveWishlist = async (newWishlist: WishlistItem[]) => {
        if (!user) return;
        try {
            await fetch("/api/secret-santa/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, wishlist: newWishlist }),
            });
        } catch (err) {
            console.error("Failed to save wishlist", err);
        }
    };

    const handleRunRaffle = async () => {
        if (!user || !user.isAdmin) return;
        if (!confirm("Are you sure? This will assign targets and cannot be undone easily.")) return;

        setLoading(true);
        try {
            const res = await fetch("/api/secret-santa/raffle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId: user.id }),
            });
            if (!res.ok) throw new Error("Failed to run raffle");

            await fetchStatus();
            alert("Raffle completed!");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden z-0">
            {/* Background */}
            <img
                src="/bg.jpg"
                alt="Christmas Background"
                className="absolute inset-0 w-full h-full object-cover z-[-2]"
            />
            <div className="absolute top-4 right-4 z-10">
                <a
                    href="/availability"
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white font-semibold transition-all shadow-lg border border-white/30"
                >
                    📅 Disponibilità
                </a>
            </div>
            <SnowEffect />

            <AnimatePresence mode="wait">
                {!user ? (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/50"
                    >
                        <h2 className="text-3xl font-bold mb-6 text-center text-red-700 drop-shadow-sm">Secret Santa 🎅</h2>
                        <form onSubmit={handleAuth} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-3 border text-gray-900 bg-white/80"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-3 border text-gray-900 bg-white/80"
                                    placeholder="Secret Password"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 rounded-lg shadow-lg text-white font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transform transition hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "Loading..." : isRegistering ? "Register" : "Login"}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-sm text-red-700 hover:text-red-900 font-medium underline decoration-red-300 underline-offset-4"
                            >
                                {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Left Column: User Info & Wishlist */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Welcome, <span className="text-red-600">{user.name}</span>! 🎄</h2>
                                    <button onClick={() => setUser(null)} className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors">Logout</button>
                                </div>

                                {isRaffleDone ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200 shadow-inner mb-6"
                                    >
                                        <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                                            <Gift className="w-6 h-6" /> Your Target
                                        </h3>
                                        {target ? (
                                            <div>
                                                <p className="text-lg text-gray-800 mb-4">You are the Secret Santa for: <span className="font-bold text-2xl text-green-700 block mt-1">{target.name}</span></p>

                                                <h4 className="font-semibold text-gray-700 mb-3">Their Wishlist:</h4>
                                                {target.wishlist && target.wishlist.length > 0 ? (
                                                    <ul className="space-y-3">
                                                        {target.wishlist.map((item) => (
                                                            <li key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-green-100 flex items-center justify-between">
                                                                <span className="font-medium text-gray-800">{item.name}</span>
                                                                {item.url && (
                                                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                                                                        <LinkIcon className="w-4 h-4" /> Link
                                                                    </a>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-gray-500 italic bg-white/50 p-3 rounded">No items in their wishlist yet.</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p>Loading target info...</p>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6 flex items-center justify-center">
                                        <p className="text-yellow-800 font-medium flex items-center gap-2">
                                            <span className="text-xl">⏳</span> Waiting for the Admin to start the raffle...
                                        </p>
                                    </div>
                                )}

                                {/* My Wishlist Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-xl">📝</span> Your Wishlist
                                    </h3>

                                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            placeholder="Item name..."
                                            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border text-gray-900"
                                        />
                                        <input
                                            type="url"
                                            value={newItemUrl}
                                            onChange={(e) => setNewItemUrl(e.target.value)}
                                            placeholder="URL (optional)..."
                                            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border text-gray-900"
                                        />
                                        <button
                                            onClick={handleAddItem}
                                            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <ul className="space-y-2">
                                        <AnimatePresence initial={false}>
                                            {wishlist.map((item) => (
                                                <motion.li
                                                    key={item.id}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between group hover:border-red-200 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <span className="font-medium text-gray-800 truncate">{item.name}</span>
                                                        {item.url && (
                                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 shrink-0">
                                                                <LinkIcon className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.li>
                                            ))}
                                        </AnimatePresence>
                                        {wishlist.length === 0 && (
                                            <p className="text-gray-500 text-center py-4 italic">Your wishlist is empty. Add something!</p>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {user.isAdmin && !isRaffleDone && (
                                <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700 text-white">
                                    <h3 className="text-lg font-bold mb-2 text-red-400">Admin Zone</h3>
                                    <p className="text-gray-300 text-sm mb-4">
                                        Once everyone has registered, click below to assign Secret Santas.
                                        <br />
                                        <span className="text-red-400 font-bold">Warning: This cannot be undone!</span>
                                    </p>
                                    <button
                                        onClick={handleRunRaffle}
                                        disabled={loading}
                                        className="w-full py-3 px-4 rounded-lg shadow-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all"
                                    >
                                        {loading ? "Running Raffle..." : "Start Raffle 🎲"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Participants List */}
                        <div className="lg:col-span-1">
                            <ParticipantList currentUser={user} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
