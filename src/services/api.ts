const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CourseResponse {
  id: number;
  title: string;
  instructor: string;
  thumbnail: string;
  rating: number;
  students: number;
  duration: string;
  level: string;
  category: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    return response.json();
  },
};

export interface CreateCourseRequest {
  title: string;
  description: string;
  categoryId: number;
  level: string;
  thumbnail: string;
  modules: {
    title: string;
    duration: string;
    videoUrl: string;
  }[];
}

export const courseApi = {
  getAllCourses: async (): Promise<CourseResponse[]> => {
    const response = await fetch(`${API_URL}/courses`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  getCoursesByCategory: async (categoryId: number): Promise<CourseResponse[]> => {
    const response = await fetch(`${API_URL}/courses/category/${categoryId}`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  getAllCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },
  
  createCourse: async (data: CreateCourseRequest, instructorId: number): Promise<any> => {
    const response = await fetch(`${API_URL}/courses?instructorId=${instructorId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create course');
    }
    return response.json();
  },
  
  getTeacherCourses: async (teacherId: number): Promise<any[]> => {
    const response = await fetch(`${API_URL}/courses/teacher/${teacherId}`);
    if (!response.ok) throw new Error('Failed to fetch teacher courses');
    return response.json();
  },
  
  updateCourse: async (courseId: number, data: CreateCourseRequest, instructorId: number): Promise<any> => {
    const response = await fetch(`${API_URL}/courses/${courseId}?instructorId=${instructorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update course');
    }
    return response.json();
  },
};

export const fileApi = {
  uploadFile: async (file: File): Promise<{ url: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/files/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
  },
};
