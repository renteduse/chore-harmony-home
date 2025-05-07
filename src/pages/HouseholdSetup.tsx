
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Users } from "lucide-react";

const HouseholdSetup = () => {
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const { isLoading, createHousehold, joinHousehold, error } = useHousehold();
  const navigate = useNavigate();

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    await createHousehold(householdName);
    navigate("/dashboard");
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    await joinHousehold(inviteCode);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rentmate-primary to-rentmate-tertiary p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome to RentMate</CardTitle>
          <CardDescription className="text-lg">
            Let's set up your household
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="join">Join Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateHousehold} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="householdName">Household Name</Label>
                  <Input
                    id="householdName"
                    placeholder="The Fun House"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-rentmate-primary hover:bg-rentmate-primary/90" 
                  disabled={isLoading}
                >
                  <Home className="mr-2 h-4 w-4" />
                  {isLoading ? "Creating..." : "Create Household"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="join">
              <form onSubmit={handleJoinHousehold} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="Enter the code shared by your roommate"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-rentmate-primary hover:bg-rentmate-primary/90" 
                  disabled={isLoading}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {isLoading ? "Joining..." : "Join Household"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <div className="text-sm text-muted-foreground">
            Set up your household to start tracking chores and expenses.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HouseholdSetup;
