import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Sparkles,
  LogOut,
  Target,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  User,
  Loader2,
  Circle,
  Plus,
  BookOpen,
  LayoutDashboard
} from "lucide-react";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();

  const [careerPlans, setCareerPlans] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    targetCareer: "Data Scientist",
    roadmapsCreated: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    tasksInProgress: 0,
    overallCompletion: 0,
    recentTasks: []
  });

  const [loading, setLoading] = useState(true);

  // AI Roadmap Input
  const [careerInput, setCareerInput] = useState("");
  const [generating, setGenerating] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [plansRes, summaryRes] = await Promise.all([
        api.getPlans(),
        api.getProgressSummary()
      ]);
      setCareerPlans(plansRes.plans);
      setSummary(summaryRes.summary);
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerInput.trim() || careerInput.trim().length < 2) {
      toast.error("Please enter a valid career path (e.g. 'Data Scientist').");
      return;
    }

    const title = careerInput.trim();
    setGenerating(true);
    toast.info("AI is creating your personalized roadmap...");

    try {
      const res = await api.generateRoadmap({ careerTitle: title });
      toast.success("AI Roadmap generated successfully!");
      setCareerInput("");
      await refreshProfile();
      await loadDashboardData();
      navigate(`/roadmap/${res.planId}`);
    } catch (err: any) {
      console.error("Roadmap generation error:", err);
      toast.error(err.message || "We couldn't generate your roadmap right now. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTaskStatus = async (task: any) => {
    try {
      if (task.completed) {
        await api.uncompleteTask(task.id);
        toast.info("Task reopened.");
      } else {
        await api.completeTask(task.id);
        toast.success("Task completed!");
      }
      await loadDashboardData();
      await refreshProfile();
    } catch (err: any) {
      toast.error("Failed to update task completion.");
    }
  };

  const displayName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "User";
  const targetCareer = profile?.targetCareer || summary.targetCareer || (careerPlans[0]?.careerTitle ?? "Data Scientist");

  return (
    <div className="min-h-screen bg-[#F8F7FF] text-slate-900 font-sans">
      {/* Navbar Header */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">AI Career Planner</h1>
              <p className="text-xs text-slate-500">Intelligent Career Guidance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center gap-2 rounded-xl">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile & Settings</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-purple-100 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Welcome back, {displayName} 👋
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Career Goal: <span className="font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">{targetCareer}</span>
            </p>
          </div>
          <Button
            onClick={() => {
              const el = document.getElementById("generate-card");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-[#6C4CE8] hover:bg-[#5B4BE7] text-white rounded-xl px-5 py-5 text-sm font-semibold shadow-md shadow-purple-200"
          >
            + Create New Roadmap
          </Button>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-purple-100 shadow-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Roadmaps Created</p>
                <p className="text-2xl font-bold text-slate-900">{summary.roadmapsCreated}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-purple-100 shadow-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tasks Completed</p>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.tasksCompleted} / {summary.totalTasks}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-purple-100 shadow-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-slate-900">{summary.tasksInProgress}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-purple-100 shadow-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 text-[#6C4CE8] rounded-xl">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Overall Completion</p>
                <p className="text-2xl font-bold text-purple-700">{summary.overallCompletion}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Completion Progress Bar */}
        <Card className="bg-white border-purple-100 shadow-sm rounded-2xl p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-800">Overall Completion</span>
              <span className="text-purple-700 font-bold bg-purple-100 px-3 py-1 rounded-full text-xs">
                {summary.overallCompletion}%
              </span>
            </div>
            <Progress value={summary.overallCompletion} className="h-3 bg-purple-50 rounded-full" />
          </div>
        </Card>

        {/* Generate Career Roadmap Card */}
        <Card id="generate-card" className="bg-white border-2 border-purple-100 shadow-lg rounded-2xl overflow-hidden p-6">
          <CardHeader className="p-0 pb-4 space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Generate Career Roadmap
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Enter a career path to get a personalized learning roadmap with video resources
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <form onSubmit={handleGenerateRoadmap} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="e.g. AI Engineer, Frontend Developer, Data Analyst"
                value={careerInput}
                onChange={(e) => setCareerInput(e.target.value)}
                disabled={generating}
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 py-6 text-base rounded-xl flex-grow focus:border-purple-600"
              />
              <Button
                type="submit"
                disabled={generating}
                className="bg-[#6C4CE8] hover:bg-[#5B4BE7] text-white font-semibold py-6 px-8 rounded-xl shadow-md min-w-[200px]"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating your personalized roadmap...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Generate Roadmap <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Saved Roadmaps Grid */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Your Career Roadmaps
            </h3>
            <span className="text-xs text-slate-500 font-medium">{careerPlans.length} Roadmaps</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading your roadmaps...</div>
          ) : careerPlans.length === 0 ? (
            <Card className="bg-white border border-purple-100 p-8 text-center rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">No career roadmap yet</h4>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Tell us your target career and we'll create a personalized learning plan for you.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerPlans.map((plan) => (
                <Card
                  key={plan.id}
                  onClick={() => navigate(`/roadmap/${plan.id}`)}
                  className="bg-white border border-purple-100 hover:border-purple-300 hover:shadow-lg cursor-pointer transition-all duration-200 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <CardHeader className="p-0 space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge className="bg-purple-100 text-purple-700 border-none px-2.5 py-0.5 text-xs font-semibold">
                        AI Roadmap
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 line-clamp-1">
                      {plan.careerTitle}
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-xs line-clamp-2">
                      {plan.overview}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Progress</span>
                      <span className="text-purple-700 font-bold">{plan.overallCompletion}%</span>
                    </div>
                    <Progress value={plan.overallCompletion} className="h-2 bg-purple-50" />
                    <div className="pt-2 flex justify-between items-center text-xs text-purple-600 font-semibold">
                      <span>View Stage Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks List */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xl font-bold text-slate-900">Recent Tasks</h3>

          {summary.recentTasks.length === 0 ? (
            <Card className="bg-white border border-purple-100 p-6 text-center rounded-2xl text-slate-500 text-sm">
              Your learning journey starts here. Generate a roadmap to view tasks.
            </Card>
          ) : (
            <div className="bg-white border border-purple-100 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
              {summary.recentTasks.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTaskStatus(task)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        task.completed ? "line-through text-slate-400" : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.isCustomGoal && (
                      <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
                        Custom Goal
                      </Badge>
                    )}
                    {task.completed ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-none text-xs px-2.5 py-0.5">
                        Done
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 border-none text-xs px-2.5 py-0.5">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
