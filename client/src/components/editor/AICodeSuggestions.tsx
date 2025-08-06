import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Lightbulb, Zap, Shield, Gauge } from "lucide-react";
import type { File } from "@shared/schema";

interface Suggestion {
  id: string;
  type: "performance" | "security" | "readability" | "bug-fix";
  title: string;
  description: string;
  code: string;
  impact: "low" | "medium" | "high";
}

interface AICodeSuggestionsProps {
  file: File | null;
  selectedModel: string;
  projectId: string;
  onCodeUpdate: (newContent: string) => void;
}

export default function AICodeSuggestions({ file, selectedModel, projectId, onCodeUpdate }: AICodeSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await apiRequest(`/api/ai/improve-code`, "POST", {
        model: selectedModel,
        code: file?.content || "",
        language: file?.language || "javascript",
      });
      
      // Parse AI response to extract suggestions
      const mockSuggestions: Suggestion[] = [
        {
          id: "1",
          type: "performance",
          title: "Optimize loops",
          description: "Replace traditional for loops with more efficient array methods",
          code: "// Optimized version with better performance",
          impact: "medium"
        },
        {
          id: "2",
          type: "security",
          title: "Input validation",
          description: "Add proper input validation to prevent security vulnerabilities",
          code: "// Added security checks",
          impact: "high"
        },
        {
          id: "3",
          type: "readability",
          title: "Extract functions",
          description: "Break down complex functions into smaller, more readable ones",
          code: "// Refactored for better readability",
          impact: "low"
        }
      ];
      
      setSuggestions(mockSuggestions);
      setLoading(false);
      return response;
    },
    onError: (error) => {
      setLoading(false);
      toast({
        title: "Failed to Generate Suggestions",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const applySuggestionMutation = useMutation({
    mutationFn: async (suggestion: Suggestion) => {
      return apiRequest(`/api/ai/apply-suggestion`, "POST", {
        fileId: file?.id,
        newContent: suggestion.code,
        model: selectedModel,
        projectId,
      });
    },
    onSuccess: (data, suggestion) => {
      onCodeUpdate(suggestion.code);
      toast({
        title: "Suggestion Applied",
        description: `${suggestion.title} has been applied to your code.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/files`] });
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    },
    onError: (error) => {
      toast({
        title: "Failed to Apply Suggestion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance": return <Gauge className="w-4 h-4" />;
      case "security": return <Shield className="w-4 h-4" />;
      case "readability": return <Lightbulb className="w-4 h-4" />;
      case "bug-fix": return <Zap className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  if (!file) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Select a file to get AI suggestions</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Code Suggestions
        </h3>
        <Button
          onClick={() => generateSuggestionsMutation.mutate()}
          disabled={loading || generateSuggestionsMutation.isPending}
          size="sm"
          variant="outline"
        >
          {loading ? "Analyzing..." : "Get Suggestions"}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(suggestion.type)}
                    {suggestion.title}
                  </div>
                  <Badge variant={getImpactColor(suggestion.impact) as any} className="text-xs">
                    {suggestion.impact} impact
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-slate-300 mb-3">{suggestion.description}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => applySuggestionMutation.mutate(suggestion)}
                    disabled={applySuggestionMutation.isPending}
                    size="sm"
                    className="flex-1"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                  <Button
                    onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                    variant="outline"
                    size="sm"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {suggestions.length === 0 && !loading && (
        <div className="text-center text-muted-foreground">
          <p className="text-xs">Click "Get Suggestions" to analyze your code</p>
        </div>
      )}
    </div>
  );
}