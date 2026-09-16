import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, Loader2, Bot, User } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const PROXY_URL = import.meta.env.VITE_PROXY_SERVER_URL || "http://localhost:5000";

const CareerChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Career Advisor. Ask me about skill recommendations, career paths, or job market trends!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setLoading(true);

    try {
      // Use Gemini proxy server for career guidance
      const res = await fetch(`${PROXY_URL}/api/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerTitle: currentInput })
      });

      if (!res.ok) throw new Error("Failed to consult AI advisor");
      const data = await res.json();

      let reply = `Here is advice for ${data.careerTitle}:\n\n`;
      if (data.steps && data.steps.length > 0) {
        data.steps.slice(0, 3).forEach((s: any, idx: number) => {
          reply += `${idx + 1}. **${s.title}**: ${s.description}\n`;
        });
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error: any) {
      toast.error("Advice consultation error: " + (error.message || error));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `For target career "${currentInput}", focus on mastering fundamental skills, working on portfolio projects, and creating a structured learning roadmap!`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-lg bg-slate-900 border-slate-800 text-white">
      <CardHeader className="p-4 border-b border-slate-800">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-purple-400" />
          AI Career Assistant
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs">Get personalized career guidance</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 max-h-[400px] px-4">
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-slate-800 rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about skills, careers..."
              disabled={loading}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
            <Button type="submit" disabled={loading || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerChatbot;