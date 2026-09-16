import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  BookOpen,
  Sparkles,
  Calendar,
  Layers,
  Clock,
  Check,
  Video
} from "lucide-react";
import YouTubePlayer from "@/components/resources/YouTubePlayer";

export const RoadmapDetail = () => {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Custom Goal state
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [addingGoal, setAddingGoal] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadPlanDetails = async () => {
    if (!planId) return;
    try {
      const res = await api.getPlanById(planId);
      setPlan(res.plan);

      if (import.meta.env.DEV && res.plan?.stages) {
        console.log("=== ROADMAP DETAIL LOADED ===");
        console.log("Plan Title:", res.plan.careerTitle);
        res.plan.stages.forEach((st: any) => {
          st.topics.forEach((tp: any) => {
            if (tp.videos && tp.videos.length > 0) {
              console.log("Curated resources for topic:", tp.title, tp.videos);
            }
          });
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load career plan details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanDetails();
  }, [planId]);

  const handleToggleTopic = async (topicId: string, currentCompleted: boolean) => {
    try {
      if (currentCompleted) {
        await api.uncompleteTask(topicId);
        toast.info("Task marked as incomplete.");
      } else {
        await api.completeTask(topicId);
        toast.success("Task completed!");
      }
      await loadPlanDetails();
      await refreshProfile();
    } catch (err: any) {
      toast.error("Failed to update task status.");
    }
  };

  const handleAddCustomGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      toast.error("Please enter a goal title.");
      return;
    }

    setAddingGoal(true);
    try {
      await api.addGoal({
        planId: planId,
        title: customTitle.trim(),
        description: customDesc.trim()
      });
      toast.success("Custom goal added successfully!");
      setCustomTitle("");
      setCustomDesc("");
      setDialogOpen(false);
      await loadPlanDetails();
      await refreshProfile();
    } catch (err: any) {
      toast.error("Failed to add custom goal.");
    } finally {
      setAddingGoal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading career roadmap details...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Roadmap Not Found</h2>
        <p className="text-slate-600">{error || "The requested career roadmap could not be loaded."}</p>
        <Button onClick={() => navigate("/dashboard")} className="bg-[#6C4CE8] text-white">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] text-slate-900 font-sans">
      {/* Header */}
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#6C4CE8] hover:bg-[#5B4BE7] text-white font-semibold rounded-xl px-4 py-2 text-sm shadow-md">
                <Plus className="h-4 w-4 mr-1.5" /> + Add Custom Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-purple-100 text-slate-900 rounded-2xl p-6">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-xl font-bold">Add Custom Goal</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Add a custom learning goal to this career roadmap.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomGoalSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Goal Title *</label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Learn Docker Containerization"
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Description (Optional)</label>
                  <Textarea
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder="Briefly describe this learning goal..."
                    className="bg-slate-50 border-slate-200 text-slate-900 min-h-[90px]"
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDialogOpen(false)}
                    className="text-slate-500"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addingGoal} className="bg-[#6C4CE8] text-white">
                    {addingGoal ? "Adding..." : "Add Custom Goal"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8">
        {/* Roadmap Overview Banner */}
        <Card className="bg-white border border-purple-100 shadow-md rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-700 border-none px-3 py-1 font-semibold text-xs">
                AI Career Roadmap
              </Badge>
              <span className="text-xs text-slate-400">
                Created {new Date(plan.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {plan.careerTitle}
            </h1>

            <p className="text-slate-600 text-base leading-relaxed">{plan.overview}</p>
          </div>

          {/* Required Skills */}
          {plan.requiredSkills && plan.requiredSkills.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-purple-50">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Required Technical Skills:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {plan.requiredSkills.map((sk: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-purple-50 text-purple-700 border border-purple-100 text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="space-y-2 pt-2 border-t border-purple-50">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-800">Overall Stage & Goal Completion</span>
              <span className="text-purple-700 font-bold bg-purple-100 px-3 py-1 rounded-full text-xs">
                {plan.overallCompletion}% ({plan.completedTopics}/{plan.totalTopics} Completed)
              </span>
            </div>
            <Progress value={plan.overallCompletion} className="h-3 bg-purple-50 rounded-full" />
          </div>
        </Card>

        {/* Roadmap Stages Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-6 w-6 text-purple-600" />
            Learning Stages & Topics
          </h2>

          {plan.stages.map((stage: any, stageIdx: number) => (
            <Card
              key={stage.id}
              className="bg-white border border-purple-100 shadow-sm rounded-2xl overflow-hidden p-6 space-y-6"
            >
              {/* Stage Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#6C4CE8] text-white rounded-xl flex items-center justify-center font-extrabold text-base shadow-sm">
                    0{stage.stageNumber || stageIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{stage.title}</h3>
                    <p className="text-xs text-slate-500">{stage.description}</p>
                  </div>
                </div>

                <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 font-medium px-3 py-1 rounded-full text-xs">
                  <Clock className="h-3.5 w-3.5 mr-1" /> {stage.duration || "2 Weeks"}
                </Badge>
              </div>

              {/* Topics List */}
              <div className="space-y-6">
                {stage.topics.map((topic: any) => (
                  <div key={topic.id} className="space-y-4 p-4 rounded-xl bg-[#FAF9FF] border border-purple-100">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`topic-${topic.id}`}
                        checked={topic.completed}
                        onCheckedChange={() => handleToggleTopic(topic.id, topic.completed)}
                        className="mt-1 h-5 w-5 border-purple-300 data-[state=checked]:bg-[#6C4CE8] data-[state=checked]:border-[#6C4CE8]"
                      />
                      <div className="flex-grow">
                        <label
                          htmlFor={`topic-${topic.id}`}
                          className={`text-base font-bold cursor-pointer ${
                            topic.completed ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {topic.title}
                        </label>
                        <p className="text-xs text-slate-600 pt-0.5">{topic.description}</p>
                      </div>
                      {topic.completed ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-none text-xs px-2.5 py-0.5 font-semibold">
                          <Check className="h-3 w-3 mr-1" /> Done
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 border-none text-xs px-2.5 py-0.5 font-semibold">
                          Pending
                        </Badge>
                      )}
                    </div>

                    {/* Embedded YouTube Video Tutorials */}
                    {topic.videos && topic.videos.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Video className="h-4 w-4 text-purple-600" /> Curated Video Resources:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {topic.videos.map((vid: any) => (
                            <YouTubePlayer
                              key={vid.videoId}
                              topicId={topic.id}
                              videoId={vid.videoId}
                              title={vid.title}
                              channelTitle={vid.channelTitle}
                              duration={vid.duration}
                              url={vid.url}
                              youtubeUrl={vid.youtubeUrl}
                              embedUrl={vid.embedUrl}
                              watchedSeconds={vid.watchedSeconds}
                              durationSeconds={vid.durationSeconds}
                              percentage={vid.percentage}
                              completed={vid.completed}
                              onProgressUpdate={() => {
                                loadPlanDetails();
                                refreshProfile();
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {/* Custom Goals Section */}
          {plan.customGoals && plan.customGoals.length > 0 && (
            <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-600" />
                Custom Learning Goals
              </h3>
              <div className="space-y-3">
                {plan.customGoals.map((cg: any) => (
                  <div
                    key={cg.id}
                    onClick={() => handleToggleTopic(cg.id, cg.completed)}
                    className="p-4 rounded-xl bg-[#FAF9FF] border border-purple-100 flex items-center justify-between cursor-pointer hover:bg-purple-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={cg.completed}
                        onCheckedChange={() => handleToggleTopic(cg.id, cg.completed)}
                        className="h-5 w-5 border-purple-300 data-[state=checked]:bg-[#6C4CE8]"
                      />
                      <div>
                        <h4
                          className={`text-base font-bold ${
                            cg.completed ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {cg.title}
                        </h4>
                        {cg.description && <p className="text-xs text-slate-500">{cg.description}</p>}
                      </div>
                    </div>

                    <Badge className="bg-amber-100 text-amber-800 border-none text-xs font-semibold px-2.5 py-0.5">
                      Custom Goal
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoadmapDetail;
