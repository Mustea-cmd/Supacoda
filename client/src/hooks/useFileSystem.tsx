import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertFile, InsertProject } from "@shared/schema";

export function useFileSystem() {
  const queryClient = useQueryClient();

  // Projects
  const createProjectMutation = useMutation({
    mutationFn: async (project: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", project);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProject> }) => {
      const response = await apiRequest("PUT", `/api/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  // Files
  const createFileMutation = useMutation({
    mutationFn: async (file: InsertFile) => {
      const response = await apiRequest("POST", "/api/files", file);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", variables.projectId, "files"] });
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertFile> }) => {
      const response = await apiRequest("PUT", `/api/files/${id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", data.projectId, "files"] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  return {
    // Projects
    createProject: createProjectMutation,
    updateProject: updateProjectMutation,
    deleteProject: deleteProjectMutation,
    
    // Files
    createFile: createFileMutation,
    updateFile: updateFileMutation,
    deleteFile: deleteFileMutation,
  };
}
