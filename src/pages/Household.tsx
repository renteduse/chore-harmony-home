
import { useState, useEffect } from "react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Users, Copy, Home } from "lucide-react";
import { User } from "@/types";

const Household = () => {
  const { household, members, refreshHousehold } = useHousehold();
  const { authState } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (household) {
      setInviteCode(household.inviteCode);
    }
  }, [household]);
  
  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success("Invite code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const isOwner = household?.owner === authState.user?._id;

  if (!household) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No household found. Please create or join a household first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Household</h1>
          <p className="text-muted-foreground">Manage your household details and members</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Household Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="mr-2 h-5 w-5" /> 
              Household Details
            </CardTitle>
            <CardDescription>
              View and manage your household information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="householdName">Household Name</Label>
              <Input 
                id="householdName" 
                value={household.name} 
                disabled={!isOwner}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <div className="flex space-x-2">
                <Input 
                  id="inviteCode" 
                  value={inviteCode} 
                  readOnly
                />
                <Button variant="outline" onClick={copyInviteCode} size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this code with your roommates to invite them to join your household
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Created On</Label>
              <p className="text-sm">{new Date(household.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Household Owner</Label>
              <p className="text-sm">
                {members.find(member => member._id === household.owner)?.name || "Unknown"}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Household Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" /> 
              Household Members
            </CardTitle>
            <CardDescription>
              {members.length} members in this household
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member: User) => (
                <div key={member._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-rentmate-primary text-white flex items-center justify-center font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div>
                    {member._id === household.owner && (
                      <span className="text-xs bg-rentmate-primary text-white px-2 py-1 rounded-full">
                        Owner
                      </span>
                    )}
                    {member._id === authState.user?._id && (
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full ml-1">
                        You
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => refreshHousehold()}
              className="w-full"
            >
              Refresh Member List
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Separator />
      
      {isOwner && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Actions here cannot be undone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" disabled>
              Delete Household
            </Button>
            <p className="text-sm text-muted-foreground">
              This will permanently delete your household and all associated data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Household;
