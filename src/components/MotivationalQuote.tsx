import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const MotivationalQuote = () => {
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [loading, setLoading] = useState(false);

  const quotes = [
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
    },
    {
      text: "The only impossible journey is the one you never begin.",
      author: "Tony Robbins",
    },
  ];

  const getRandomQuote = () => {
    setLoading(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    getRandomQuote();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium italic text-foreground">"{quote.text}"</p>
                  <p className="text-sm text-muted-foreground">— {quote.author}</p>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={getRandomQuote}
              disabled={loading}
              className="ml-4 flex-shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MotivationalQuote;
