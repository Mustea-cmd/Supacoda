import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Code2, 
  FileText, 
  Bug, 
  Zap, 
  RefreshCw, 
  FileCode,
  TestTube,
  BookOpen
} from "lucide-react";
import type { File } from "@shared/schema";

interface QuickActionsProps {
  file: File | null;
  selectedModel: string;
  projectId: string;
  onCodeUpdate: (newContent: string) => void;
}

export default function QuickActions({ file, selectedModel, projectId, onCodeUpdate }: QuickActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const quickActionMutation = useMutation({
    mutationFn: async (action: string) => {
      return apiRequest(`/api/ai/edit-code`, "POST", {
        model: selectedModel,
        fileId: file?.id,
        instruction: action,
        projectId,
      });
    },
    onSuccess: (data: any) => {
      onCodeUpdate(data.file.content);
      toast({
        title: "Code Updated",
        description: `${selectedModel} completed the action successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/files`] });
    },
    onError: (error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const actions = [
    {
      id: "optimize",
      icon: <Zap className="w-4 h-4" />,
      label: "Optimize",
      description: "Improve performance and efficiency",
      instruction: "Optimize this code for better performance, memory usage, and efficiency. Remove any redundant code and apply best practices.",
      color: "bg-yellow-600 hover:bg-yellow-700"
    },
    {
      id: "refactor",
      icon: <RefreshCw className="w-4 h-4" />,
      label: "Refactor",
      description: "Improve code structure and readability",
      instruction: "Refactor this code to improve readability, maintainability, and follow best practices. Extract reusable functions and improve naming conventions.",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: "add-comments",
      icon: <FileText className="w-4 h-4" />,
      label: "Add Comments",
      description: "Add helpful documentation",
      instruction: "Add comprehensive comments and documentation to this code. Include function descriptions, parameter explanations, and inline comments for complex logic.",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      id: "fix-bugs",
      icon: <Bug className="w-4 h-4" />,
      label: "Fix Bugs",
      description: "Find and fix potential issues",
      instruction: "Analyze this code for potential bugs, errors, or edge cases. Fix any issues you find and add proper error handling.",
      color: "bg-red-600 hover:bg-red-700"
    },
    {
      id: "add-tests",
      icon: <TestTube className="w-4 h-4" />,
      label: "Add Tests",
      description: "Generate unit tests",
      instruction: "Create comprehensive unit tests for this code. Include test cases for normal operation, edge cases, and error conditions.",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      id: "modernize",
      icon: <Code2 className="w-4 h-4" />,
      label: "Modernize",
      description: "Update to latest standards",
      instruction: "Modernize this code to use the latest language features, best practices, and modern syntax. Update deprecated methods and improve overall code quality.",
      color: "bg-indigo-600 hover:bg-indigo-700"
    }
  ];

  if (!file) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Code2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Select a file to use quick actions</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Quick Actions</h3>
        <Badge variant="outline" className="text-xs">
          {selectedModel}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            onClick={() => quickActionMutation.mutate(action.instruction)}
            disabled={quickActionMutation.isPending}
            variant="outline"
            size="sm"
            className={`h-auto p-3 flex flex-col items-start gap-1 text-left hover:bg-slate-700 border-slate-600`}
          >
            <div className="flex items-center gap-2 w-full">
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </div>
            <span className="text-xs text-muted-foreground leading-tight">
              {action.description}
            </span>
          </Button>
        ))}
      </div>

      {quickActionMutation.isPending && (
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {selectedModel} is working on your code...
          </div>
        </div>
      )}
    </div>
  );
}