
// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  household?: string;
  isHouseholdOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Household types
export interface Household {
  _id: string;
  name: string;
  inviteCode: string;
  owner: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

// Chore types
export enum ChoreFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export interface Chore {
  _id: string;
  name: string;
  description?: string;
  frequency: ChoreFrequency;
  assignedTo: User;
  householdId: string;
  nextDueDate: string;
  completed: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChoreLog {
  _id: string;
  choreId: string;
  completedBy: string;
  completedAt: string;
}

// Expense types
export interface ExpenseParticipant {
  userId: string;
  userName: string;
  share: number;
}

export interface Expense {
  _id: string;
  amount: number;
  description: string;
  date: string;
  paidBy: string;
  paidByName: string;
  participants: ExpenseParticipant[];
  householdId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  userId: string;
  userName: string;
  netBalance: number;
}

export interface Settlement {
  fromUser: string;
  fromUserName: string;
  toUser: string;
  toUserName: string;
  amount: number;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: 'chore' | 'expense';
  color: string;
  resourceId: string;
}
