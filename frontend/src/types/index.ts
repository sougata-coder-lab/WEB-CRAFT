export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Version {
  code: string;
  prompt: string;
  createdAt: string;
}

export interface Project {
  _id: string;
  userId: string;
  title: string;
  prompt: string;
  code: string;
  isPublished: boolean;
  versions: Version[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityProject {
  id: string;
  title: string;
  prompt: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    initials: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface GenerationStep {
  label: string;
  done: boolean;
}
