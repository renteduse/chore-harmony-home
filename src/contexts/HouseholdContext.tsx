
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Household, User } from "@/types";
import { householdAPI } from "@/services/api";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface HouseholdContextProps {
  household: Household | null;
  members: User[];
  isLoading: boolean;
  error: string | null;
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (inviteCode: string) => Promise<void>;
  refreshHousehold: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextProps | undefined>(undefined);

export const HouseholdProvider = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load household data when authenticated
  useEffect(() => {
    const loadHousehold = async () => {
      if (!authState.isAuthenticated) {
        setHousehold(null);
        setMembers([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const householdData = await householdAPI.getHousehold();
        setHousehold(householdData);
        
        if (householdData) {
          const membersData = await householdAPI.getMembers(householdData._id);
          setMembers(membersData);
        }
        
        setError(null);
      } catch (error: any) {
        setError(error.toString());
      } finally {
        setIsLoading(false);
      }
    };

    if (!authState.isLoading) {
      loadHousehold();
    }
  }, [authState.isAuthenticated, authState.isLoading]);

  const createHousehold = async (name: string) => {
    setIsLoading(true);
    try {
      const newHousehold = await householdAPI.create({ name });
      setHousehold(newHousehold);
      setMembers([authState.user as User]);
      toast.success(`Household "${name}" created successfully!`);
    } catch (error: any) {
      setError(error.toString());
      toast.error("Failed to create household");
    } finally {
      setIsLoading(false);
    }
  };

  const joinHousehold = async (inviteCode: string) => {
    setIsLoading(true);
    try {
      const joinedHousehold = await householdAPI.join(inviteCode);
      setHousehold(joinedHousehold);
      
      const membersData = await householdAPI.getMembers(joinedHousehold._id);
      setMembers(membersData);
      
      toast.success(`Joined household "${joinedHousehold.name}" successfully!`);
    } catch (error: any) {
      setError(error.toString());
      toast.error("Failed to join household");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHousehold = async () => {
    if (!household) return;
    
    setIsLoading(true);
    try {
      const refreshedHousehold = await householdAPI.getHousehold();
      setHousehold(refreshedHousehold);
      
      const membersData = await householdAPI.getMembers(refreshedHousehold._id);
      setMembers(membersData);
      
      setError(null);
    } catch (error: any) {
      setError(error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HouseholdContext.Provider
      value={{
        household,
        members,
        isLoading,
        error,
        createHousehold,
        joinHousehold,
        refreshHousehold,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error("useHousehold must be used within a HouseholdProvider");
  }
  return context;
};
