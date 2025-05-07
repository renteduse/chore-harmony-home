
import { useState, useEffect } from "react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Chore, ChoreFrequency } from "@/types";
import { api } from "@/services/api";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, ListCheck, Plus, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Chores = () => {
  const { household } = useHousehold();
  const { authState } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [choreLogs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("active");

  useEffect(() => {
    if (!household) return;

    const fetchChores = async () => {
      setIsLoading(true);
      try {
        const response = await api.chores.getAll(household._id);
        setChores(response.data);
        
        // Get chore logs
        const logsResponse = await api.chores.getLogs(household._id);
        setLogs(logsResponse.data);
      } catch (error) {
        toast.error("Failed to fetch chores");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChores();
  }, [household]);

  const markChoreComplete = async (choreId: string) => {
    try {
      const response = await api.chores.markComplete(choreId);
      
      // Update the chore in the local state
      setChores(prevChores => 
        prevChores.map(chore => 
          chore._id === choreId ? response.data : chore
        )
      );
      
      toast.success("Chore marked as complete!");
    } catch (error) {
      toast.error("Failed to mark chore as complete");
      console.error(error);
    }
  };

  // Filter chores by status
  const activeChores = chores.filter(chore => !chore.completed);
  const myChores = chores.filter(chore => 
    !chore.completed && chore.assignedTo._id === authState.user?._id);

  const getFrequencyBadgeColor = (frequency: ChoreFrequency) => {
    switch (frequency) {
      case ChoreFrequency.DAILY:
        return "bg-red-100 text-red-800";
      case ChoreFrequency.WEEKLY:
        return "bg-blue-100 text-blue-800";
      case ChoreFrequency.BIWEEKLY:
        return "bg-green-100 text-green-800";
      case ChoreFrequency.MONTHLY:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return "Invalid date";
    }
  };

  if (!household) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Household Found</h1>
          <p className="mb-4">You need to create or join a household first.</p>
          <Link to="/household-setup">
            <Button>Set Up Household</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chores</h1>
          <p className="text-muted-foreground">Manage household tasks and responsibilities</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/calendar">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
          </Link>
          <Link to="/chores/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Chore
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">All Chores</TabsTrigger>
          <TabsTrigger value="mine">My Chores</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        {/* All Chores Tab */}
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">Loading chores...</div>
          ) : activeChores.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
              <ListCheck className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">No active chores</h3>
              <p className="text-muted-foreground mb-4">Create chores to keep track of household tasks</p>
              <Link to="/chores/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Chore
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeChores.map((chore) => (
                <Card key={chore._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{chore.name}</CardTitle>
                      <Badge className={getFrequencyBadgeColor(chore.frequency)}>
                        {chore.frequency}
                      </Badge>
                    </div>
                    <CardDescription>
                      Assigned to {chore.assignedTo.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{chore.description || "No description provided."}</p>
                    <p className="text-sm mt-2">
                      Due: <span className="font-medium">{formatDate(chore.nextDueDate)}</span>
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => markChoreComplete(chore._id)} 
                      variant="outline" 
                      className="w-full"
                      disabled={chore.assignedTo._id !== authState.user?._id}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark Complete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* My Chores Tab */}
        <TabsContent value="mine" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">Loading your chores...</div>
          ) : myChores.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
              <ListCheck className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">No chores assigned to you</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myChores.map((chore) => (
                <Card key={chore._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{chore.name}</CardTitle>
                      <Badge className={getFrequencyBadgeColor(chore.frequency)}>
                        {chore.frequency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{chore.description || "No description provided."}</p>
                    <p className="text-sm mt-2">
                      Due: <span className="font-medium">{formatDate(chore.nextDueDate)}</span>
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => markChoreComplete(chore._id)} 
                      className="w-full"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark Complete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">Loading chore history...</div>
          ) : choreLogs.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-medium">No chore history</h3>
              <p className="text-muted-foreground">Complete chores to see them in the history</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-muted/50">
                <div className="grid grid-cols-3 gap-4 font-medium">
                  <div>Chore</div>
                  <div>Completed By</div>
                  <div>Date</div>
                </div>
              </div>
              <div className="divide-y">
                {choreLogs.map((log) => (
                  <div key={log._id} className="p-4 grid grid-cols-3 gap-4">
                    <div>{log.choreId.name}</div>
                    <div>{log.completedBy.name}</div>
                    <div>{formatDate(log.completedAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Chores;
