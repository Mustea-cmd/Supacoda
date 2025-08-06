import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Code } from "lucide-react";

interface AIModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function AIModelSelector({ selectedModel, onModelChange }: AIModelSelectorProps) {
  const { data: models, isLoading } = useQuery({
    queryKey: ["/api/ai/models"],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-slate-700 rounded mb-2"></div>
        <div className="h-8 bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center">
        <Bot className="h-4 w-4 mr-2 text-blue-500" />
        AI Assistant
      </h3>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-slate-200">
          <SelectValue placeholder="Select AI Model" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {models?.map((model: any) => (
            <SelectItem key={model.id} value={model.id} className="text-slate-200 focus:bg-slate-700">
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mt-2 flex space-x-1">
        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2">
          <MessageSquare className="h-3 w-3 mr-1" />
          Chat
        </Button>
        <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs py-1 px-2">
          <Code className="h-3 w-3 mr-1" />
          Generate
        </Button>
      </div>
    </div>
  );
}
