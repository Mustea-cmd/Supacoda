import { type Project, type InsertProject, type File, type InsertFile, type AIConversation, type InsertAIConversation, type AIModel } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  listProjects(): Promise<Project[]>;

  // Files
  getFile(id: string): Promise<File | undefined>;
  getFilesByProject(projectId: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, file: Partial<InsertFile>): Promise<File>;
  deleteFile(id: string): Promise<void>;

  // AI Conversations
  getConversation(id: string): Promise<AIConversation | undefined>;
  getConversationsByProject(projectId: string): Promise<AIConversation[]>;
  createConversation(conversation: InsertAIConversation): Promise<AIConversation>;
  updateConversation(id: string, conversation: Partial<InsertAIConversation>): Promise<AIConversation>;

  // AI Models
  getAIModels(): Promise<AIModel[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project> = new Map();
  private files: Map<string, File> = new Map();
  private conversations: Map<string, AIConversation> = new Map();
  private aiModels: Map<string, AIModel> = new Map();

  constructor() {
    // Initialize default AI models
    const defaultModels: AIModel[] = [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", apiKey: null, isActive: true },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google", apiKey: null, isActive: true },
      { id: "amazon-q-developer", name: "Amazon Q Developer", provider: "amazon", apiKey: null, isActive: true },
      { id: "copilot-gpt-4", name: "Microsoft Copilot", provider: "microsoft", apiKey: null, isActive: true },
      { id: "deepseek-coder", name: "DeepSeek Coder", provider: "deepseek", apiKey: null, isActive: true },
      { id: "llama-3.3", name: "Llama 3.3", provider: "ollama", apiKey: null, isActive: true },
    ];

    defaultModels.forEach(model => {
      this.aiModels.set(model.id, model);
    });

    // Create a sample project
    const sampleProject: Project = {
      id: randomUUID(),
      name: "my-ai-project",
      description: "A sample AI-powered Flask application",
      githubUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(sampleProject.id, sampleProject);

    // Create sample files
    const sampleFiles: File[] = [
      {
        id: randomUUID(),
        projectId: sampleProject.id,
        name: "app.py",
        path: "/app.py",
        content: `import flask
from flask import request, jsonify

# AI-Generated Flask Application
app = flask.Flask(__name__)

@app.route('/')
def home():
    return "Hello, AI-powered World!"

# TODO: Add authentication endpoint
@app.route('/api/users', methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
        return jsonify([
            {"id": 1, "name": "John Doe"},
            {"id": 2, "name": "Jane Smith"}
        ])

if __name__ == '__main__':
    app.run(debug=True)`,
        language: "python",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        projectId: sampleProject.id,
        name: "requirements.txt",
        path: "/requirements.txt",
        content: `flask==2.3.3
python-dotenv==1.0.0
requests==2.31.0`,
        language: "text",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        projectId: sampleProject.id,
        name: "README.md",
        path: "/README.md",
        content: `# My AI Project

A Flask application built with AI assistance.

## Setup

1. Install dependencies: \`pip install -r requirements.txt\`
2. Run the app: \`python app.py\`

## Features

- Basic Flask web server
- API endpoints
- AI-generated code`,
        language: "markdown",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleFiles.forEach(file => {
      this.files.set(file.id, file);
    });
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = randomUUID();
    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) throw new Error("Project not found");
    
    const updated: Project = {
      ...existing,
      ...project,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
    // Also delete associated files
    for (const [fileId, file] of this.files.entries()) {
      if (file.projectId === id) {
        this.files.delete(fileId);
      }
    }
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByProject(projectId: string): Promise<File[]> {
    return Array.from(this.files.values()).filter(file => file.projectId === projectId);
  }

  async createFile(file: InsertFile): Promise<File> {
    const id = randomUUID();
    const newFile: File = {
      ...file,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.files.set(id, newFile);
    return newFile;
  }

  async updateFile(id: string, file: Partial<InsertFile>): Promise<File> {
    const existing = this.files.get(id);
    if (!existing) throw new Error("File not found");
    
    const updated: File = {
      ...existing,
      ...file,
      updatedAt: new Date(),
    };
    this.files.set(id, updated);
    return updated;
  }

  async deleteFile(id: string): Promise<void> {
    this.files.delete(id);
  }

  async getConversation(id: string): Promise<AIConversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByProject(projectId: string): Promise<AIConversation[]> {
    return Array.from(this.conversations.values()).filter(conv => conv.projectId === projectId);
  }

  async createConversation(conversation: InsertAIConversation): Promise<AIConversation> {
    const id = randomUUID();
    const newConversation: AIConversation = {
      ...conversation,
      id,
      createdAt: new Date(),
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(id: string, conversation: Partial<InsertAIConversation>): Promise<AIConversation> {
    const existing = this.conversations.get(id);
    if (!existing) throw new Error("Conversation not found");
    
    const updated: AIConversation = {
      ...existing,
      ...conversation,
    };
    this.conversations.set(id, updated);
    return updated;
  }

  async getAIModels(): Promise<AIModel[]> {
    return Array.from(this.aiModels.values()).filter(model => model.isActive);
  }
}

export const storage = new MemStorage();
