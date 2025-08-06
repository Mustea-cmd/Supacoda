import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/aiService";
import { insertProjectSchema, insertFileSchema, insertAIConversationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.listProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Files
  app.get("/api/projects/:projectId/files", async (req, res) => {
    try {
      const files = await storage.getFilesByProject(req.params.projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const fileData = insertFileSchema.parse(req.body);
      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ message: "Invalid file data" });
    }
  });

  app.put("/api/files/:id", async (req, res) => {
    try {
      const fileData = insertFileSchema.partial().parse(req.body);
      const file = await storage.updateFile(req.params.id, fileData);
      res.json(file);
    } catch (error) {
      res.status(400).json({ message: "Failed to update file" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      await storage.deleteFile(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // AI Models
  app.get("/api/ai/models", async (req, res) => {
    try {
      const models = await storage.getAIModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI models" });
    }
  });

  // AI Chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { model, messages, projectId } = req.body;
      
      if (!model || !messages) {
        return res.status(400).json({ message: "Model and messages are required" });
      }

      const response = await aiService.chatWithAI(model, messages);
      
      // Save conversation if projectId is provided
      if (projectId) {
        const conversationData = insertAIConversationSchema.parse({
          projectId,
          model,
          messages: [...messages, { role: "assistant", content: response.content }],
        });
        await storage.createConversation(conversationData);
      }

      res.json(response);
    } catch (error) {
      console.error("AI Chat error:", error);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  // AI Code Generation
  app.post("/api/ai/generate-code", async (req, res) => {
    try {
      const { model, prompt, language, context, projectId } = req.body;
      
      if (!model || !prompt || !language) {
        return res.status(400).json({ message: "Model, prompt, and language are required" });
      }

      const response = await aiService.generateCode(model, prompt, language, context);
      
      // Save conversation if projectId is provided
      if (projectId) {
        const conversationData = insertAIConversationSchema.parse({
          projectId,
          model,
          messages: [
            { role: "user", content: `Generate ${language} code: ${prompt}` },
            { role: "assistant", content: response.content }
          ],
        });
        await storage.createConversation(conversationData);
      }

      res.json(response);
    } catch (error) {
      console.error("AI Code Generation error:", error);
      res.status(500).json({ message: "Failed to generate code" });
    }
  });

  // AI Code Explanation
  app.post("/api/ai/explain-code", async (req, res) => {
    try {
      const { model, code, language } = req.body;
      
      if (!model || !code || !language) {
        return res.status(400).json({ message: "Model, code, and language are required" });
      }

      const response = await aiService.explainCode(model, code, language);
      res.json(response);
    } catch (error) {
      console.error("AI Code Explanation error:", error);
      res.status(500).json({ message: "Failed to explain code" });
    }
  });

  // AI Code Improvements
  app.post("/api/ai/improve-code", async (req, res) => {
    try {
      const { model, code, language } = req.body;
      
      if (!model || !code || !language) {
        return res.status(400).json({ message: "Model, code, and language are required" });
      }

      const response = await aiService.suggestImprovements(model, code, language);
      res.json(response);
    } catch (error) {
      console.error("AI Code Improvements error:", error);
      res.status(500).json({ message: "Failed to suggest improvements" });
    }
  });

  // AI Conversations
  app.get("/api/projects/:projectId/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByProject(req.params.projectId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
