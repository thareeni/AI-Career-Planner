import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

export const StageSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.string().default("2 Weeks"),
  topics: z.array(z.string()).min(1)
});

export const CareerRoadmapSchema = z.object({
  career: z.string(),
  overview: z.string(),
  skills: z.array(z.string()),
  stages: z.array(StageSchema).min(1)
});

export type StructuredRoadmap = z.infer<typeof CareerRoadmapSchema>;

export async function generateStructuredRoadmap(
  careerTitle: string,
  userProfile?: { education?: string; experienceLevel?: string; skills?: string; interests?: string }
): Promise<StructuredRoadmap> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 5 && apiKey !== "your_gemini_api_key_here") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an expert AI Career Counselor and Curriculum Designer.
Generate a comprehensive, step-by-step career learning roadmap for someone aspiring to become a "${careerTitle}".

User Context:
- Experience Level: ${userProfile?.experienceLevel || "Beginner"}
- Existing Skills: ${userProfile?.skills || "None specified"}
- Education: ${userProfile?.education || "Not specified"}
- Interests: ${userProfile?.interests || "General learning"}

Requirements:
- Provide an overview of the career path.
- List 5 to 8 key required technical/soft skills.
- Provide 5 to 7 sequential learning stages (e.g. 01 Programming Fundamentals, 02 Data Analysis, 03 Machine Learning, 04 Projects, 05 Interview Preparation).
- In each stage, include a stage title, estimated duration (e.g. "2 Weeks", "3 Weeks"), concise description, and 3 to 5 specific topics.
- Output ONLY valid JSON matching this exact structure without markdown fences:
{
  "career": "${careerTitle}",
  "overview": "Comprehensive 2-3 sentence career summary and guidance...",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  "stages": [
    {
      "title": "Stage Title 1",
      "description": "Clear description of stage 1",
      "duration": "2 Weeks",
      "topics": ["Topic 1", "Topic 2", "Topic 3"]
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();

      const cleaned = responseText
        .replace(/^```json/g, "")
        .replace(/^```/g, "")
        .replace(/```$/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      return CareerRoadmapSchema.parse(parsed);
    } catch (err) {
      console.warn("Gemini API call failed or schema invalid, using intelligent fallback generator:", err);
    }
  }

  // Smart structured fallback generator based on career title
  return generateFallbackRoadmap(careerTitle, userProfile);
}

function generateFallbackRoadmap(
  careerTitle: string,
  userProfile?: { experienceLevel?: string; skills?: string }
): StructuredRoadmap {
  const normalized = careerTitle.toLowerCase().trim();

  if (normalized.includes("data scientist") || normalized.includes("data science") || normalized.includes("data analyst")) {
    return {
      career: careerTitle,
      overview: "Data Scientists combine statistical analysis, machine learning, and programming to extract actionable insights from data and build predictive models.",
      skills: ["Python", "SQL", "Statistics & Probability", "Data Analysis (Pandas, NumPy)", "Machine Learning", "Data Visualization"],
      stages: [
        {
          title: "Programming & Data Fundamentals",
          description: "Master foundational programming in Python, data structures, and database querying with SQL.",
          duration: "3 Weeks",
          topics: ["Python Fundamentals & OOP", "SQL & Relational Databases", "Git & Version Control"]
        },
        {
          title: "Data Analysis & Wrangling",
          description: "Learn to clean, manipulate, and visualize datasets efficiently using core Python scientific libraries.",
          duration: "3 Weeks",
          topics: ["NumPy & Matrix Operations", "Pandas DataFrames", "Data Visualization with Matplotlib & Seaborn"]
        },
        {
          title: "Mathematics & Applied Statistics",
          description: "Build a strong theoretical foundation in statistics, probability distributions, and hypothesis testing.",
          duration: "2 Weeks",
          topics: ["Probability & Distributions", "Descriptive & Inferential Statistics", "Hypothesis Testing & A/B Testing"]
        },
        {
          title: "Machine Learning Core",
          description: "Understand supervised and unsupervised machine learning algorithms using Scikit-Learn.",
          duration: "4 Weeks",
          topics: ["Linear & Logistic Regression", "Decision Trees & Random Forests", "Clustering & Dimensionality Reduction"]
        },
        {
          title: "Applied Projects & Portfolio",
          description: "Build end-to-end data science projects, exploratory analysis, and predictive web demos.",
          duration: "3 Weeks",
          topics: ["Beginner EDA Project", "Predictive ML Model Deployment", "Capstone Portfolio Project"]
        },
        {
          title: "Interview Preparation",
          description: "Prepare for data science technical interviews, coding challenges, and system design.",
          duration: "2 Weeks",
          topics: ["SQL & Python Coding Challenges", "ML System Design & Case Studies", "Resume & Behavioral Prep"]
        }
      ]
    };
  }

  if (normalized.includes("frontend") || normalized.includes("web dev") || normalized.includes("react")) {
    return {
      career: careerTitle,
      overview: "Frontend Developers create interactive, high-performance web user interfaces using modern JavaScript frameworks and design systems.",
      skills: ["HTML5", "CSS3 / Tailwind CSS", "JavaScript ES6+", "TypeScript", "React", "State Management & REST APIs"],
      stages: [
        {
          title: "Web Foundations & HTML/CSS",
          description: "Master core semantic web markup, modern CSS layouts, responsive design, and CSS frameworks.",
          duration: "2 Weeks",
          topics: ["HTML5 Semantic Structure", "CSS Flexbox & Grid Layouts", "Tailwind CSS Styling"]
        },
        {
          title: "JavaScript & Modern ES6+",
          description: "Understand core programming concepts, async/await promises, DOM manipulation, and modern ES modules.",
          duration: "3 Weeks",
          topics: ["JavaScript Syntax & ES6+", "DOM Manipulation & Events", "Async JavaScript & Fetch API"]
        },
        {
          title: "React & Component Architecture",
          description: "Build dynamic client-side applications with React components, hooks, state management, and routing.",
          duration: "4 Weeks",
          topics: ["React Components & Props", "Hooks (useState, useEffect)", "React Router & Navigation"]
        },
        {
          title: "TypeScript & Production Tooling",
          description: "Add static typing to frontend codebases and utilize Vite, build tools, and modern linting.",
          duration: "2 Weeks",
          topics: ["TypeScript Types & Interfaces", "Vite & Build Tooling", "State Management & Context API"]
        },
        {
          title: "Fullstack Integration & Projects",
          description: "Connect frontend interfaces to backend REST APIs, authentication flows, and live hosting.",
          duration: "3 Weeks",
          topics: ["REST API Consumption", "User Auth & JWT Handling", "Production UI Capstone Project"]
        }
      ]
    };
  }

  // General tech career default roadmap
  return {
    career: careerTitle,
    overview: `A structured professional roadmap to master key competencies, practical tools, and industry standards required for a successful career as a ${careerTitle}.`,
    skills: ["Core Fundamentals", "Industry Standard Tools", "System Architecture", "Best Practices", "Problem Solving"],
    stages: [
      {
        title: "Foundational Knowledge & Core Skills",
        description: `Master basic concepts, foundational tools, and syntax essential for a ${careerTitle}.`,
        duration: "3 Weeks",
        topics: ["Core Concepts & Terminology", "Development Environment Setup", "Version Control with Git"]
      },
      {
        title: "Intermediate Practical Applications",
        description: `Apply your knowledge by solving real-world challenges and building structured modules.`,
        duration: "3 Weeks",
        topics: ["Core Principles & Patterns", "Data Handling & Storage", "Testing & Debugging"]
      },
      {
        title: "Advanced Specialization & Tools",
        description: `Deepen your technical expertise in advanced tools, frameworks, and performance optimization.`,
        duration: "4 Weeks",
        topics: ["Advanced Techniques", "Performance & Optimization", "Security & System Design"]
      },
      {
        title: "Portfolio Projects & Practical Demos",
        description: `Build and publish hands-on portfolio projects demonstrating end-to-end expertise.`,
        duration: "3 Weeks",
        topics: ["Initial Mini-Project", "End-to-End System Project", "Documentation & Presentation"]
      },
      {
        title: "Career & Technical Interview Readiness",
        description: `Prepare technical portfolio, practice technical interview questions, and build professional presence.`,
        duration: "2 Weeks",
        topics: ["Technical Q&A Review", "Mock Technical Interview", "Resume & Profile Preparation"]
      }
    ]
  };
}
