export interface GeneratedStep {
  title: string;
  description: string;
  order: number;
  searchKeywords: string[];
}

export interface GeneratedRoadmapResponse {
  careerTitle: string;
  steps: GeneratedStep[];
}

const PROXY_URL = import.meta.env.VITE_PROXY_SERVER_URL || "http://localhost:5000";

export async function generateRoadmapAI(careerTitle: string): Promise<GeneratedRoadmapResponse> {
  try {
    const response = await fetch(`${PROXY_URL}/api/roadmap/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ careerTitle })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error calling roadmap proxy service:", error);
    throw error;
  }
}
