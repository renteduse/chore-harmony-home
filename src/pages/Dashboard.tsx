
import { useEffect, useState } from "react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, CheckCheck, DollarSign, ListCheck, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Chore, Expense, Balance } from "@/types";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { household, members } = useHousehold();
  const { authState } = useAuth();
  const [upcomingChores, setUpcomingChores] = useState<Chore[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!household) return;
      
      setIsLoading(true);
      try {
        // Fetch upcoming chores
        const chores = await api.chores.getAll(household._id);
        setUpcomingChores(chores.slice(0, 3));
        
        // Fetch recent expenses
        const expenses = await api.expenses.getAll(household._id);
        setRecentExpenses(expenses.slice(0, 3));
        
        // Fetch balances
        const balanceData = await api.expenses.getBalances(household._id);
        setBalances(balanceData);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [household]);

  const userBalance = balances.find(b => b.userId === authState.user?._id);
  
  const markChoreComplete = async (choreId: string) => {
    try {
      await api.chores.markComplete(choreId);
      // Update the chore in the local state
      setUpcomingChores(prevChores => 
        prevChores.map(chore => 
          chore._id === choreId ? { ...chore, completed: true } : chore
        )
      );
      toast.success("Chore marked as complete!");
    } catch (error) {
      toast.error("Failed to mark chore as complete");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!household) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {authState.user?.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/household">
            <Button variant="outline">Manage Household</Button>
          </Link>
          <Link to="/expenses/new">
            <Button>
              <DollarSign className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
            <DollarSign className={`h-4 w-4 ${userBalance && userBalance.netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${userBalance && userBalance.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {userBalance ? formatCurrency(userBalance.netBalance) : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {userBalance && userBalance.netBalance > 0 
                ? "You are owed money" 
                : userBalance && userBalance.netBalance < 0 
                ? "You owe money" 
                : "You're all settled up"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Chores</CardTitle>
            <ListCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingChores.filter(c => !c.completed).length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingChores.filter(c => !c.completed && c.assignedTo._id === authState.user?._id).length} assigned to you
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentExpenses.length + upcomingChores.filter(c => c.completed).length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actions in the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">
            <ListCheck className="mr-2 h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <DollarSign className="mr-2 h-4 w-4" />
            Expenses
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Loading chores...</div>
                </CardContent>
              </Card>
            ) : upcomingChores.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No upcoming chores</h3>
                    <p className="text-muted-foreground mt-1">Add some chores to get started</p>
                    <Link to="/chores">
                      <Button className="mt-4">
                        <ListCheck className="mr-2 h-4 w-4" />
                        Manage Chores
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              upcomingChores.map(chore => (
                <Card key={chore._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{chore.name}</CardTitle>
                      <div className="text-sm font-medium">
                        {chore.frequency}
                      </div>
                    </div>
                    <CardDescription>
                      Assigned to {chore.assignedTo.name} • Due {new Date(chore.nextDueDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    {chore.completed ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Completed
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => markChoreComplete(chore._id)} 
                        variant="outline" 
                        className="w-full"
                        disabled={chore.assignedTo._id !== authState.user?._id}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Mark Complete
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
            
            <div className="text-center mt-2">
              <Link to="/chores">
                <Button variant="ghost">View All Chores</Button>
              </Link>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid gap-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Loading expenses...</div>
                </CardContent>
              </Card>
            ) : recentExpenses.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No recent expenses</h3>
                    <p className="text-muted-foreground mt-1">Add some expenses to get started</p>
                    <Link to="/expenses/new">
                      <Button className="mt-4">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Add Expense
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              recentExpenses.map(expense => (
                <Card key={expense._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{expense.description}</CardTitle>
                      <div className="font-bold">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                    <CardDescription>
                      Paid by {expense.paidByName} • {new Date(expense.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <div className="w-full text-sm text-muted-foreground">
                      Split between {expense.participants.length} people
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
            
            <div className="text-center mt-2">
              <Link to="/expenses">
                <Button variant="ghost">View All Expenses</Button>
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
