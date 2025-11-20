import { Type } from "@google/genai";

export enum Status {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee?: string; // Initials or name
  tags: string[];
  createdAt: number;
}

export interface ColumnType {
  id: Status;
  title: string;
}

// AI Response Schemas

export const aiTaskSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "description", "priority"]
};

export const aiPlanSchema = {
  type: Type.ARRAY,
  items: aiTaskSchema
};
