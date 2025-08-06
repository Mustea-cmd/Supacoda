import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Code, Edit3, Sparkles } from "lucide-react";
import type { File } from "@shared/schema";

interface AICodeEditorProps {
  file: File | null;
  selectedModel: string;
  projectId: string;
  onCodeUpdate: (newContent: string) => void;
}

export default function AICodeEditor({ file, selectedModel, projectId, onCodeUpdate }: AICodeEditorProps) {
  const [editInstruction, setEditInstruction] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const editCodeMutation = useMutation({
    mutationFn: async (instruction: string) => {
      return apiRequest(`/api/ai/edit-code`, "POST", {
        model: selectedModel,
        fileId: file?.id,
        instruction,
        projectId,
      });
    },
    onSuccess: (data: any) => {
      onCodeUpdate(data.file.content);
      toast({
        title: "Code Updated",
        description: `${selectedModel} successfully modified your code.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/files`] });
      setEditInstruction("");
      setShowEditor(false);
    },
    onError: (error) => {
      toast({
        title: "Edit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const applyCodeMutation = useMutation({
    mutationFn: async (newContent: string) => {
      return apiRequest(`/api/ai/apply-suggestion`, "POST", {
        fileId: file?.id,
        newContent,
        model: selectedModel,
        projectId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Code Applied",
        description: "AI-generated code has been applied to your file.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/files`] });
    },
    onError: (error) => {
      toast({
        title: "Apply Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditCode = () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to edit.",
        variant: "destructive",
      });
      return;
    }

    if (!editInstruction.trim()) {
      toast({
        title: "No Instruction",
        description: "Please provide instructions for the AI.",
        variant: "destructive",
      });
      return;
    }

    editCodeMutation.mutate(editInstruction);
  };

  const handleApplyCode = (code: string) => {
    onCodeUpdate(code);
    applyCodeMutation.mutate(code);
  };

  if (!file) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Select a file to enable AI code editing</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">AI Code Editor</span>
        <span className="text-xs text-muted-foreground">({selectedModel})</span>
      </div>

      {!showEditor ? (
        <div className="flex gap-2">
          <Button
            onClick={() => setShowEditor(true)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Code with AI
          </Button>
          <Button
            onClick={() => {
              const instruction = "Optimize this code for better performance and readability";
              setEditInstruction(instruction);
              editCodeMutation.mutate(instruction);
            }}
            variant="outline"
            size="sm"
            disabled={editCodeMutation.isPending}
          >
            <Code className="w-4 h-4 mr-2" />
            Quick Optimize
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea
            value={editInstruction}
            onChange={(e) => setEditInstruction(e.target.value)}
            placeholder="Tell the AI what changes to make to your code..."
            className="min-h-[80px] resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleEditCode}
              disabled={editCodeMutation.isPending || !editInstruction.trim()}
              size="sm"
              className="flex-1"
            >
              {editCodeMutation.isPending ? "Editing..." : "Apply Changes"}
            </Button>
            <Button
              onClick={() => {
                setShowEditor(false);
                setEditInstruction("");
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {editCodeMutation.isPending && (
        <div className="mt-3 text-sm text-muted-foreground text-center">
          <Bot className="w-4 h-4 inline mr-2" />
          {selectedModel} is editing your code...
        </div>
      )}
    </div>
  );
}