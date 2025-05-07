
import { useState, useEffect } from "react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Expense, Balance } from "@/types";
import { api } from "@/services/api";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Expenses = () => {
  const { household } = useHousehold();
  const { authState } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("expenses");

  useEffect(() => {
    if (!household) return;

    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        // Get expenses
        const expensesResponse = await api.expenses.getAll(household._id);
        setExpenses(expensesResponse.data);
        
        // Get balances
        const balancesResponse = await api.expenses.getBalances(household._id);
        setBalances(balancesResponse.data);
      } catch (error) {
        toast.error("Failed to fetch expenses");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [household]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return "Invalid date";
    }
  };

  // Find the current user's balance
  const userBalance = balances.find(b => b.userId === authState.user?._id);

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
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track shared expenses and balances</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/settlements">
            <Button variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Settle Up
            </Button>
          </Link>
          <Link to="/expenses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
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
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} expenses total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                expenses
                  .filter(expense => expense.paidBy === authState.user?._id)
                  .reduce((sum, expense) => sum + expense.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.filter(expense => expense.paidBy === authState.user?._id).length} expenses paid by you
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="expenses" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>
        
        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
              <DollarSign className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">No expenses yet</h3>
              <p className="text-muted-foreground mb-4">Add expenses to track shared costs</p>
              <Link to="/expenses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </Link>
            </div>
          ) : (
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-muted/50">
                <div className="grid grid-cols-5 gap-4 font-medium">
                  <div className="col-span-2">Description</div>
                  <div>Amount</div>
                  <div>Paid By</div>
                  <div>Date</div>
                </div>
              </div>
              <div className="divide-y">
                {expenses.map((expense) => (
                  <div key={expense._id} className="p-4 grid grid-cols-5 gap-4">
                    <div className="col-span-2">
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Split between {expense.participants.length} people
                      </div>
                    </div>
                    <div className="font-medium">{formatCurrency(expense.amount)}</div>
                    <div>{expense.paidByName}</div>
                    <div>{formatDate(expense.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">Loading balances...</div>
          ) : balances.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-medium">No balance information</h3>
              <p className="text-muted-foreground">Add expenses to calculate balances</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {balances.map((balance) => (
                <Card key={balance.userId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{balance.userName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${balance.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(balance.netBalance)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {balance.netBalance > 0 
                        ? "is owed money" 
                        : balance.netBalance < 0 
                        ? "owes money" 
                        : "is all settled up"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="flex justify-center mt-4">
            <Link to="/settlements">
              <Button>
                View Settlement Suggestions
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Expenses;
