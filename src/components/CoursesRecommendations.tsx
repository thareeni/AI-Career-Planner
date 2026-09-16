import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, ExternalLink } from "lucide-react";

interface Course {
  id: string;
  title: string;
  provider: string;
  level: string;
  url: string;
}

const SAMPLE_COURSES: Course[] = [
  {
    id: "1",
    title: "Google AI & Machine Learning Specialization",
    provider: "Coursera",
    level: "Intermediate",
    url: "https://www.coursera.org"
  },
  {
    id: "2",
    title: "Full-Stack Web Development Bootcamp",
    provider: "freeCodeCamp",
    level: "Beginner to Advanced",
    url: "https://www.freecodecamp.org"
  },
  {
    id: "3",
    title: "AWS Certified Cloud Practitioner Pathway",
    provider: "AWS Skill Builder",
    level: "Beginner",
    url: "https://aws.amazon.com/training/"
  }
];

const CoursesRecommendations = () => {
  return (
    <Card className="bg-slate-900 border-slate-800 text-white shadow-lg">
      <CardHeader className="p-4 border-b border-slate-800">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-blue-400" />
          Recommended Platforms & Courses
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Top rated learning paths for career acceleration
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {SAMPLE_COURSES.map((c) => (
          <div
            key={c.id}
            className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg flex justify-between items-center hover:border-slate-600 transition-colors"
          >
            <div>
              <h4 className="text-sm font-semibold text-white">{c.title}</h4>
              <p className="text-xs text-slate-400">{c.provider} • {c.level}</p>
            </div>
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-purple-400 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CoursesRecommendations;
