export interface WishlistItem {
    id: string;
    name: string;
    url?: string;
}

export interface Participant {
    id: string;
    name: string;
    password: string;
    wishlist: WishlistItem[];
    targetId: string | null;
    isAdmin: boolean;
}

export interface SecretSantaState {
    isRaffleDone: boolean;
}
