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
        const userEmail = (user.email || '').toLowerCase();
        const isAdminEmail = userEmail === 'roadyakib@gmail.com';

        if (snapshot.exists()) {
          const currentProfile = snapshot.val();
          
          // Force admin role if email matches but role isn't admin
          if (isAdminEmail && currentProfile.role !== 'admin') {
            currentProfile.role = 'admin';
            await firebaseSet(profileRef, currentProfile);
          }
          
          set({ profile: currentProfile, isLoading: false });
        } else {
          // Create default profile for new user
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Student',
            photoURL: user.photoURL || '',
            role: isAdminEmail ? "admin" : "student",
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
