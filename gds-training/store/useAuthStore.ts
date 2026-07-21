import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get as firebaseGet, set as firebaseSet } from 'firebase/database';

export type UserRole = "student" | "instructor" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  init: () => void;
  setProfile: (profile: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  init: () => {
    if (typeof window === 'undefined') return;
    
    // Listen for Firebase Auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ user });
        // Fetch profile from Realtime DB
        const profileRef = ref(db, `users/${user.uid}`);
        const snapshot = await firebaseGet(profileRef);
        
        if (snapshot.exists()) {
          set({ profile: snapshot.val(), isLoading: false });
        } else {
          // Create default profile for new user
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Student',
            photoURL: user.photoURL || '',
            role: "student",
            createdAt: new Date().toISOString()
          };
          await firebaseSet(profileRef, newProfile);
          set({ profile: newProfile, isLoading: false });
        }
      } else {
        set({ user: null, profile: null, isLoading: false });
      }
    });
  }
}));
