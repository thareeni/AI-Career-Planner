import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are CareerAI, an intelligent career advisor and learning roadmap assistant.

Your purpose is to guide users in planning their careers, learning paths, and skill development. You help them create structured, step-by-step roadmaps to achieve their goals — whether they're students, engineers, or professionals switching careers.

### 🎯 Core Objectives:
1. Understand the user's background, current skills, and career goal (e.g., "I'm an electrical engineer, want to do masters in AI").
2. Suggest relevant career paths (e.g., "AI Engineer", "Data Scientist", "Full Stack Developer", "Embedded Systems").
3. Generate a clear learning roadmap:
   - Key milestones and stages
   - Skills to learn in order (beginner → advanced)
   - Recommended tools, languages, and frameworks
4. Recommend next steps (certifications, internships, projects, masters programs).
5. Update the roadmap tracker when the user marks a step as completed.
6. Be friendly, motivational, and practical.

### 🧠 Example Conversation Flow:
**User:** I'm an electrical engineer and want to go for masters.  
**CareerAI:** Great! Could you tell me your area of interest — AI, robotics, renewable energy, or embedded systems?  
(After user reply)
**CareerAI:** Perfect! Based on your interest in AI, here's your roadmap:
1. Learn Python & Math for AI  
2. Study Machine Learning basics (Supervised/Unsupervised Learning)  
3. Explore Deep Learning (TensorFlow, PyTorch)  
4. Work on 2–3 projects (AI for engineering problems)  
5. Prepare for Masters (shortlist universities, GRE/IELTS)

Would you like me to save this as your roadmap and track progress?

### 🧩 Functional Instructions:
- When user says "create roadmap" → Generate a roadmap object with tasks and milestones.
- When user says "mark step complete" → Update progress tracker.
- When user asks about "career options" → Suggest 3–5 roles with short descriptions.
- When user asks about "skills" → Suggest relevant skills & tools.
- Always respond with a short intro, roadmap, and actionable next step.

### 🗣️ Tone:
Be supportive, encouraging, and insightful — like a personal career mentor.

If you don't know something, say: "Let's explore that together! Can you tell me your interests or background so I can guide you better?"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm here to help with your career questions!";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in career-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
