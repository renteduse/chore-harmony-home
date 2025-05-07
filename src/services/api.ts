
import { toast } from "sonner";
import { Chore, Expense, Household, Settlement } from "@/types";

const API_URL = "http://localhost:5000/api";

// Helper function to handle API errors
const handleError = (error: any) => {
  console.error("API Error:", error);
  const errorMessage = error.response?.data?.message || "An unexpected error occurred";
  toast.error(errorMessage);
  return Promise.reject(errorMessage);
};

// Set up axios with authorization headers
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Auth API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      
      const data = await response.json();
      localStorage.setItem("token", data.token);
      return data;
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      const data = await response.json();
      localStorage.setItem("token", data.token);
      return data;
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  getProfile: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get profile");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  logout: () => {
    localStorage.removeItem("token");
  },
};

// Household API
export const householdAPI = {
  create: async (householdData: { name: string }) => {
    try {
      const response = await fetch(`${API_URL}/households`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(householdData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create household");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  join: async (inviteCode: string) => {
    try {
      const response = await fetch(`${API_URL}/households/join`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ inviteCode }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to join household");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  getHousehold: async () => {
    try {
      const response = await fetch(`${API_URL}/households/current`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User doesn't have a household yet
        }
        const error = await response.json();
        throw new Error(error.message || "Failed to get household");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  getMembers: async (householdId: string) => {
    try {
      const response = await fetch(`${API_URL}/households/${householdId}/members`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get household members");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
};

// Chores API
export const choresAPI = {
  getAll: async (householdId: string) => {
    try {
      const response = await fetch(`${API_URL}/chores?householdId=${householdId}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get chores");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  create: async (choreData: Partial<Chore>) => {
    try {
      const response = await fetch(`${API_URL}/chores`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(choreData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create chore");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  markComplete: async (choreId: string) => {
    try {
      const response = await fetch(`${API_URL}/chores/${choreId}/complete`, {
        method: "POST",
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to mark chore as complete");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  getLogs: async (householdId: string) => {
    try {
      const response = await fetch(`${API_URL}/chores/logs?householdId=${householdId}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get chore logs");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
};

// Expenses API
export const expensesAPI = {
  getAll: async (householdId: string) => {
    try {
      const response = await fetch(`${API_URL}/expenses?householdId=${householdId}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get expenses");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  create: async (expenseData: Partial<Expense>) => {
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(expenseData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create expense");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  getBalances: async (householdId: string) => {
    try {
      const response = await fetch(`${API_URL}/expenses/balances?householdId=${householdId}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get balances");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
  
  getSettlements: async (householdId: string) => {
    try {
      const response = await fetch(`${API_URL}/expenses/settlements?householdId=${householdId}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get settlement suggestions");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
};

// Calendar API
export const calendarAPI = {
  getEvents: async (householdId: string, startDate: string, endDate: string) => {
    try {
      const response = await fetch(
        `${API_URL}/calendar?householdId=${householdId}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: getHeaders(),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get calendar events");
      }
      
      return await response.json();
    } catch (error: any) {
      return handleError(error);
    }
  },
};

// Export all APIs
export const api = {
  auth: authAPI,
  household: householdAPI,
  chores: choresAPI,
  expenses: expensesAPI,
  calendar: calendarAPI,
};
