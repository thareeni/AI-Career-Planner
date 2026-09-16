import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/services/api";

export interface UserData {
  id: string;
  email: string;
  fullName?: string;
  displayName: string;
  targetCareer?: string;
  education?: string;
  degree?: string;
  experienceLevel?: string;
  skills?: string;
  interests?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface UserProfileStats {
  roadmapsCreated: number;
  tasksCompleted: number;
  totalTasks: number;
  tasksInProgress: number;
  overallCompletion: number;
}

export interface UserProfileData {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  education: string;
  degree: string;
  experienceLevel: string;
  skills: string;
  interests: string;
  targetCareer: string;
  createdAt: string;
  lastLoginAt: string;
  stats: UserProfileStats;
}

interface AuthContextType {
  user: UserData | null;
  profile: UserProfileData | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, pass: string, fullName: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (displayName: string, additional?: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
      await fetchProfile();
    } catch (err: any) {
      console.warn("Session expired or invalid token:", err);
      localStorage.removeItem("auth_token");
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.getProfile();
      setProfile(res.profile);
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const signUp = async (email: string, pass: string, fullName: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.register({ email, password: pass, fullName });
      localStorage.setItem("auth_token", res.token);
      setUser(res.user);
      await fetchProfile();
    } catch (err: any) {
      const msg = err.message || "Registration failed. Please check your credentials.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      localStorage.setItem("auth_token", res.token);
      setUser(res.user);
      await fetchProfile();
    } catch (err: any) {
      const msg = err.message || "Invalid email or password.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const updateUserProfile = async (displayName: string, additional?: any) => {
    try {
      await api.updateProfile({ displayName, ...additional });
      await fetchProfile();
      if (user) {
        setUser({ ...user, displayName });
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        updateUserProfile,
        refreshProfile: fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
