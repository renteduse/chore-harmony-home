
import { useState, useEffect } from "react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Settlement } from "@/types";
import { api } from "@/services/api";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, DollarSign } from "lucide-react";

const Settlements = () => {
  const { household } = useHousehold();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!household) return;

    const fetchSettlements = async () => {
      setIsLoading(true);
      try {
        const response = await api.expenses.getSettlements(household._id);
        setSettlements(response.data);
      } catch (error) {
        toast.error("Failed to fetch settlement suggestions");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettlements();
  }, [household]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
          <h1 className="text-3xl font-bold">Settlement Suggestions</h1>
          <p className="text-muted-foreground">Suggested payments to settle all debts</p>
        </div>
        <Link to="/expenses">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Expenses
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Optimal Payment Plan</CardTitle>
          <CardDescription>
            These suggested payments will settle all debts with the minimum number of transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading settlement suggestions...</div>
          ) : settlements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg font-medium">Everything is settled up!</div>
              <p className="text-muted-foreground mt-2">There are no outstanding balances to settle</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted/50 border-b">
                <div className="grid grid-cols-3 font-medium">
                  <div>From</div>
                  <div>To</div>
                  <div>Amount</div>
                </div>
              </div>
              <div className="divide-y">
                {settlements.map((settlement, index) => (
                  <div key={index} className="p-4 grid grid-cols-3">
                    <div>{settlement.fromUserName}</div>
                    <div>{settlement.toUserName}</div>
                    <div className="font-medium">{formatCurrency(settlement.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium mb-2">How to use this?</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-medium">1.</span> Ask the people in the "From" column to pay the people in the "To" column
              </li>
              <li>
                <span className="font-medium">2.</span> Once payments are made, record new expenses to reflect them
              </li>
              <li>
                <span className="font-medium">3.</span> Payment suggestions will automatically update once recorded
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settlements;
