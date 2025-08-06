import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { File } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Bot, User, Copy, Plus, Settings, Send, Paperclip, Mic } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  selectedModel: string;
  selectedFile: File | null;
  projectId?: string;
}

export default function AIChat({ selectedModel, selectedFile, projectId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: aiModels } = useQuery({
    queryKey: ["/api/ai/models"],
  });

  const chatMutation = useMutation({
    mutationFn: async ({ model, messages, projectId }: { model: string; messages: any[]; projectId?: string }) => {
      const response = await apiRequest("POST", "/api/ai/chat", { model, messages, projectId });
      return response.json();
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      }]);
    },
    onError: (error) => {
      toast({
        title: "AI Error",
        description: error.message,
        variant: "destructive",
      });
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
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      }]);
    },
    onError: (error) => {
      toast({
        title: "Code Generation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const explainCodeMutation = useMutation({
    mutationFn: async ({ model, code, language }: { model: string; code: string; language: string }) => {
      const response = await apiRequest("POST", "/api/ai/explain-code", { model, code, language });
      return response.json();
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      }]);
    },
    onError: (error) => {
      toast({
        title: "Code Explanation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    const chatMessages = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    chatMutation.mutate({
      model: selectedModel,
      messages: chatMessages,
      projectId,
    });

    setInputValue("");
  };

  const handleGenerateCode = () => {
    if (!inputValue.trim() || !selectedFile) return;

    const userMessage: Message = {
      role: "user",
      content: `Generate ${selectedFile.language} code: ${inputValue}`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    generateCodeMutation.mutate({
      model: selectedModel,
      prompt: inputValue,
      language: selectedFile.language || "javascript",
      context: selectedFile.content || undefined,
      projectId,
    });

    setInputValue("");
  };

  const handleExplainCode = () => {
    if (!selectedFile?.content) {
      toast({
        title: "No code to explain",
        description: "Please select a file with content to explain.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: `Explain this ${selectedFile.language} code`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    explainCodeMutation.mutate({
      model: selectedModel,
      code: selectedFile.content,
      language: selectedFile.language || "javascript",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSendMessage();
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard.",
    });
  };

  const getModelDisplayName = (modelId: string) => {
    const model = aiModels?.find((m: any) => m.id === modelId);
    return model?.name || modelId;
  };

  return (
    <div className="h-full bg-slate-800 border-l border-slate-700 flex flex-col">
      {/* Chat Header */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">AI Assistant</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-green-400">{getModelDisplayName(selectedModel)}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-slate-700">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateCode}
            disabled={!selectedFile || generateCodeMutation.isPending}
            className="text-xs border-slate-600 hover:bg-slate-700"
          >
            <Plus className="h-3 w-3 mr-1" />
            {generateCodeMutation.isPending ? "Generating..." : "Generate"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExplainCode}
            disabled={!selectedFile?.content || explainCodeMutation.isPending}
            className="text-xs border-slate-600 hover:bg-slate-700"
          >
            <Bot className="h-3 w-3 mr-1" />
            {explainCodeMutation.isPending ? "Explaining..." : "Explain"}
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              <Bot className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Start a conversation with AI</p>
              <p className="text-xs mt-1">Ask questions, generate code, or get explanations</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-lg p-3 ${
                message.role === "user" 
                  ? "bg-blue-600 text-white ml-4" 
                  : "bg-slate-900 text-slate-200 mr-4"
              }`}>
                {message.role === "assistant" && (
                  <div className="flex items-center mb-2">
                    <Bot className="h-4 w-4 text-blue-400 mr-2" />
                    <span className="text-xs font-medium">{getModelDisplayName(selectedModel)}</span>
                  </div>
                )}
                
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>

                {message.role === "assistant" && (
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(message.content)}
                      className="text-xs h-6 px-2 border-slate-600 hover:bg-slate-700"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {(chatMutation.isPending || generateCodeMutation.isPending || explainCodeMutation.isPending) && (
            <div className="flex justify-start">
              <div className="bg-slate-900 rounded-lg p-3 mr-4">
                <div className="flex items-center">
                  <Bot className="h-4 w-4 text-blue-400 mr-2" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-3 border-t border-slate-700">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask AI to help with your code..."
            className="flex-1 bg-slate-900 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-blue-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || chatMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span>Ctrl+Enter to send</span>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-white" title="Upload file">
              <Paperclip className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-white" title="Voice input">
              <Mic className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
