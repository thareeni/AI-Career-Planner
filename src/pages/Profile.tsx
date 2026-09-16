import React, { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { User, Mail, Award, CheckCircle2, Clock, Target, ArrowLeft, Loader2, Save, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Profile = () => {
  const { user, profile, updateUserProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(displayName.trim());
      toast.success("Profile settings updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const initial = (displayName || user?.email || "T")[0].toUpperCase();
  const stats = profile?.stats || {
    roadmapsCreated: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    tasksInProgress: 0,
    overallCompletion: 0
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] text-slate-900 font-sans">
      {/* Navbar Header */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-slate-600 hover:text-purple-700 flex items-center gap-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <Button variant="outline" onClick={() => signOut()} className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl space-y-8">
        {/* Profile Avatar Header */}
        <div className="text-center space-y-3">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6C4CE8] to-[#4F46E5] text-white flex items-center justify-center text-4xl font-extrabold mx-auto shadow-xl shadow-purple-200">
            {initial}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
            <p className="text-slate-500 text-sm">Manage your account information and preferences</p>
          </div>
        </div>

        {/* Account Information Card */}
        <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Email Address */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" /> Email Address
              </Label>
              <Input
                disabled
                value={user?.email || profile?.email || "thareeniab@gmail.com"}
                className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed h-11 rounded-xl text-base"
              />
              <p className="text-xs text-slate-400 font-medium">Email cannot be changed</p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-purple-600" /> Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-600 focus:ring-purple-500 h-11 rounded-xl text-base"
              />
            </div>

            {/* Save Changes Button */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-[#6C4CE8] hover:bg-[#5B4BE7] text-white font-semibold py-5 h-12 shadow-lg shadow-purple-200 rounded-xl text-base flex items-center justify-center gap-2"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Saving Changes...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-5 w-5" /> Save Changes
                </span>
              )}
            </Button>
          </form>
        </Card>

        {/* Your Progress Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" /> Your Progress
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl p-4">
              <p className="text-xs text-slate-500 font-semibold">Roadmaps Created</p>
              <p className="text-3xl font-extrabold text-[#6C4CE8] pt-1">{stats.roadmapsCreated}</p>
            </Card>

            <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl p-4">
              <p className="text-xs text-slate-500 font-semibold">Tasks Completed</p>
              <p className="text-3xl font-extrabold text-purple-600 pt-1">
                {stats.tasksCompleted} / {stats.totalTasks}
              </p>
            </Card>

            <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl p-4">
              <p className="text-xs text-slate-500 font-semibold">In Progress</p>
              <p className="text-3xl font-extrabold text-slate-800 pt-1">{stats.tasksInProgress}</p>
            </Card>
          </div>

          <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-800">Overall Completion</span>
              <span className="text-purple-700 font-bold bg-purple-100 px-3 py-1 rounded-full text-xs">
                {stats.overallCompletion}%
              </span>
            </div>
            <Progress value={stats.overallCompletion} className="h-3 bg-purple-50 rounded-full" />
          </Card>
        </div>

        {/* Account Activity Details */}
        <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl p-6 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Account Created: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Recently"}</span>
          </div>
          <div>
            <span>Last Sign In: {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "Just Now"}</span>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
