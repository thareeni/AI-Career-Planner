import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Bot, Target, TrendingUp, BookOpen, Award, Sparkles, ArrowRight, PlayCircle, Layers, ShieldCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bot,
      title: "AI Roadmap Generation",
      description: "Generate structured, step-by-step career learning paths tailored to your goals.",
    },
    {
      icon: BookOpen,
      title: "Curated YouTube Videos",
      description: "Auto-recommend top-rated video tutorials directly linked to each roadmap topic.",
    },
    {
      icon: PlayCircle,
      title: "Embedded Player & Progress Tracking",
      description: "Watch video tutorials inside the application with automatic watch progress tracking.",
    },
    {
      icon: TrendingUp,
      title: "Live Completion Analytics",
      description: "Track completion percentage across stages, topics, and custom learning goals.",
    },
    {
      icon: Target,
      title: "Custom Learning Goals",
      description: "Add personalized goals and tasks directly to your active career roadmaps.",
    },
    {
      icon: ShieldCheck,
      title: "Real Database Persistence",
      description: "All progress, roadmaps, and profile settings are securely stored in the backend.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#6C4CE8] font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
            <Sparkles className="h-6 w-6 text-[#6C4CE8]" />
            <span className="bg-gradient-to-r from-[#6C4CE8] to-[#4F46E5] bg-clip-text text-transparent">
              AI Career Planner
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#home" className="hover:text-purple-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-purple-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-purple-600 transition-colors">How It Works</a>
            <a href="#about" className="hover:text-purple-600 transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-slate-700 hover:text-purple-600 font-medium"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              className="bg-[#6C4CE8] hover:bg-[#5B4BE7] text-white shadow-md shadow-purple-200 px-5 rounded-xl font-medium"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-[#F8F7FF] via-purple-50/40 to-[#FAF9FF]">
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/80 text-purple-700 text-xs sm:text-sm font-semibold border border-purple-200 shadow-sm">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Next-Gen Career Learning & Progress System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-[#6C4CE8] via-[#5B4BE7] to-[#4F46E5] bg-clip-text text-transparent">
                Career Planner
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Navigate your career journey with intelligent guidance, personalized roadmaps, and curated learning resources.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-[#6C4CE8] to-[#4F46E5] hover:opacity-95 text-white shadow-xl shadow-purple-200 text-base font-semibold px-8 py-6 rounded-xl min-w-[200px]"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50 text-base font-semibold px-8 py-6 rounded-xl min-w-[200px]"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything You Need to Master Your Career
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Smart tools and AI-driven insights to accelerate your skills and track learning progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-[#FAF9FF] border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 rounded-2xl p-6"
              >
                <CardContent className="p-0 space-y-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-[#F8F7FF]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Four simple steps to transform your career learning goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Create Account", desc: "Register your free account and set your career goals." },
              { step: "02", title: "Generate Roadmap", desc: "Enter your target career path to receive an AI structured roadmap." },
              { step: "03", title: "Watch Video Lessons", desc: "Watch YouTube tutorials with real-time video watch tracking." },
              { step: "04", title: "Track Progress", desc: "Mark topics as completed and view your live completion percentage." }
            ].map((st, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm space-y-3 text-center">
                <span className="text-3xl font-extrabold text-purple-600">{st.step}</span>
                <h4 className="text-lg font-bold text-slate-900">{st.title}</h4>
                <p className="text-sm text-slate-600">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#6C4CE8] via-[#5B4BE7] to-[#4F46E5] text-white">
        <div className="container mx-auto px-4 text-center space-y-6 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Start Your Career Journey?</h2>
          <p className="text-purple-100 text-lg">
            Create your account today and let AI guide your career learning progression.
          </p>
          <div>
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-white text-purple-700 hover:bg-purple-50 font-bold px-8 py-6 rounded-xl shadow-2xl text-base"
            >
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-purple-100 text-center text-slate-500 text-sm">
        <div className="container mx-auto px-4">
          <p>&copy; 2025 AI Career Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;