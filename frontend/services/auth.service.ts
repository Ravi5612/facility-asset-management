import { LoginFormData } from "@/lib/validations/auth";

export const authService = {
  login: async (data: LoginFormData) => {
    // This is a mock API call to simulate network request delay.
    // In the future, this will use fetch() or axios to call the NestJS backend.
    
    return new Promise<{ success: boolean; message: string; token?: string }>((resolve, reject) => {
      setTimeout(() => {
        // Mock authentication logic
        if (data.email === "admin@gate2desk.com" && data.password === "password") {
          resolve({
            success: true,
            message: "Login successful",
            token: "mock-jwt-token",
          });
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 1500); // 1.5 second delay
    });
  },
};
