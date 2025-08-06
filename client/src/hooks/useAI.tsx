import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AIResponse {
  content: string;
  model: string;
}

export function useAI() {
  const chatMutation = useMutation({
    mutationFn: async ({ model, messages, projectId }: {
      model: string;
      messages: AIMessage[];
      projectId?: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai/chat", { model, messages, projectId });
      return response.json();
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: async ({ model, prompt, language, context, projectId }: {
      model: string;
      prompt: string;
      language: string;
      context?: string;
      projectId?: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai/generate-code", {
        model, prompt, language, context, projectId
      });
      return response.json();
    },
  });

  const explainCodeMutation = useMutation({
    mutationFn: async ({ model, code, language }: {
      model: string;
      code: string;
      language: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai/explain-code", { model, code, language });
      return response.json();
    },
  });

  const improveCodeMutation = useMutation({
    mutationFn: async ({ model, code, language }: {
      model: string;
      code: string;
      language: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai/improve-code", { model, code, language });
      return response.json();
    },
  });

  return {
    chat: chatMutation,
    generateCode: generateCodeMutation,
    explainCode: explainCodeMutation,
    improveCode: improveCodeMutation,
  };
}
