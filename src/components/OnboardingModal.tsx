import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (targetCareer: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [targetCareer, setTargetCareer] = useState("Data Scientist");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [education, setEducation] = useState("Bachelor's");
  const [degree, setDegree] = useState("Computer Science");
  const [skills, setSkills] = useState("Python, SQL, Excel");
  const [interests, setInterests] = useState("Artificial Intelligence, Data Analytics");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCareer.trim()) {
      toast.error("Please enter a target career goal.");
      return;
    }

    setSubmitting(true);
    try {
      await api.saveOnboarding({
        education,
        degree,
        experienceLevel,
        skills,
        interests,
        targetCareer: targetCareer.trim()
      });
      toast.success("Profile onboarding completed!");
      onSuccess(targetCareer.trim());
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save onboarding preferences.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-purple-100 text-slate-900 max-w-lg shadow-2xl rounded-2xl p-6">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Welcome to AI Career Planner!
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Tell us about your background and target career so AI can personalize your learning roadmaps.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="targetCareer" className="text-slate-700 font-semibold">Target Career Goal *</Label>
            <Input
              id="targetCareer"
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              placeholder="e.g. Data Scientist, Frontend Developer, AI Engineer"
              required
              className="bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-600 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold">Experience Level</Label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:border-purple-600"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold">Education Level</Label>
              <Input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. Bachelor's, High School"
                className="bg-slate-50 border-slate-200 text-slate-900 h-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-semibold">Degree / Field of Study</Label>
            <Input
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="e.g. Computer Science, Information Technology"
              className="bg-slate-50 border-slate-200 text-slate-900 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-semibold">Current Skills (comma separated)</Label>
            <Input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, SQL, HTML, Problem Solving"
              className="bg-slate-50 border-slate-200 text-slate-900 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-semibold">Interests</Label>
            <Input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Artificial Intelligence, Web Development"
              className="bg-slate-50 border-slate-200 text-slate-900 text-sm"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-5 shadow-lg rounded-xl"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Preferences...
                </span>
              ) : (
                "Save & View Dashboard"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
