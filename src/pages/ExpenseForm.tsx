
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHousehold } from "@/contexts/HouseholdContext";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

// Schema for form validation
const expenseFormSchema = z.object({
  amount: z.string().min(1, { message: "Amount is required" })
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      { message: "Amount must be a positive number" }
    ),
  description: z.string().min(1, { message: "Description is required" }),
  date: z.date({
    required_error: "Please select a date",
  }),
  participants: z.array(
    z.object({
      userId: z.string(),
      userName: z.string(),
      share: z.number(),
      included: z.boolean().default(true),
    })
  ),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { household, members } = useHousehold();
  const { authState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEqualSplit, setIsEqualSplit] = useState(true);
  const [numberOfParticipants, setNumberOfParticipants] = useState(members.length);

  // Initialize form
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: "",
      description: "",
      date: new Date(),
      participants: members.map(member => ({
        userId: member._id,
        userName: member.name,
        share: 0, // Will be calculated when form is submitted
        included: true,
      })),
    },
  });

  // Watch amount to recalculate shares
  const watchAmount = form.watch("amount");
  const watchParticipants = form.watch("participants");

  // Calculate shares when amount or participants change
  const calculateShares = () => {
    const amount = parseFloat(watchAmount || "0");
    if (isNaN(amount) || amount <= 0) return;

    const includedParticipants = watchParticipants.filter(p => p.included);
    setNumberOfParticipants(includedParticipants.length);

    if (includedParticipants.length === 0) return;

    const equalShare = parseFloat((amount / includedParticipants.length).toFixed(2));
    
    // Update the share for each participant
    const updatedParticipants = watchParticipants.map(participant => ({
      ...participant,
      share: participant.included ? equalShare : 0,
    }));

    form.setValue("participants", updatedParticipants);
  };

  // Update shares when amount changes
  React.useEffect(() => {
    if (isEqualSplit) {
      calculateShares();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchAmount, JSON.stringify(watchParticipants.map(p => p.included)), isEqualSplit]);

  const toggleParticipant = (userId: string) => {
    const updatedParticipants = form.getValues("participants").map(p => {
      if (p.userId === userId) {
        return { ...p, included: !p.included };
      }
      return p;
    });
    
    form.setValue("participants", updatedParticipants);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    if (!household) {
      toast.error("You need to be part of a household to create expenses");
      return;
    }

    // Prepare participant data
    const finalParticipants = data.participants
      .filter(p => p.included)
      .map(p => ({
        userId: p.userId,
        userName: p.userName,
        share: p.share,
      }));

    // Validate that all participants have a share
    if (finalParticipants.length === 0) {
      toast.error("Please include at least one participant");
      return;
    }

    // Validate that the sum of shares equals the total amount
    const totalAmount = parseFloat(data.amount);
    const sumShares = finalParticipants.reduce((sum, p) => sum + p.share, 0);
    
    // Check if shares sum up to the total (allowing for small floating-point differences)
    if (Math.abs(totalAmount - sumShares) > 0.01) {
      toast.error("The sum of shares does not equal the total amount");
      return;
    }

    setIsSubmitting(true);
    try {
      // Add householdId to the expense data
      const expenseData = {
        amount: parseFloat(data.amount),
        description: data.description,
        date: data.date,
        participants: finalParticipants,
        householdId: household._id
      };

      await api.expenses.create(expenseData);
      toast.success("Expense created successfully");
      navigate("/expenses");
    } catch (error) {
      console.error("Failed to create expense:", error);
      toast.error("Failed to create expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!household) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Household Found</h1>
          <p className="mb-4">You need to be part of a household to create expenses.</p>
          <Button onClick={() => navigate("/household-setup")}>
            Set Up Household
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Expense</h1>
        <p className="text-muted-foreground">Record a shared expense for your household</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>Enter the expense information and specify how it's split</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                          <Input 
                            placeholder="0.00" 
                            {...field} 
                            className="pl-8"
                            type="number"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        The total amount of the expense
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the expense was incurred
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Groceries, Rent, Utilities" {...field} />
                    </FormControl>
                    <FormDescription>
                      A brief description of the expense
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">Paid by</h3>
                  <p className="text-muted-foreground text-sm">
                    {authState.user?.name} (You)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">Split between</h3>
                    <div className="flex items-center">
                      <Checkbox 
                        id="equal-split" 
                        checked={isEqualSplit} 
                        onCheckedChange={() => setIsEqualSplit(!isEqualSplit)}
                      />
                      <label 
                        htmlFor="equal-split" 
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Equal split
                      </label>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg">
                    <div className="p-3 border-b bg-muted/50">
                      <div className="grid grid-cols-3 gap-4 font-medium">
                        <div>Member</div>
                        <div>Included</div>
                        <div>Share</div>
                      </div>
                    </div>
                    <div className="divide-y">
                      {form.getValues("participants").map((participant, index) => (
                        <div key={participant.userId} className="p-3 grid grid-cols-3 gap-4 items-center">
                          <div>{participant.userName}</div>
                          <div>
                            <Checkbox 
                              checked={participant.included} 
                              onCheckedChange={() => toggleParticipant(participant.userId)}
                              id={`participant-${participant.userId}`}
                            />
                          </div>
                          <div>
                            {participant.included ? (
                              isEqualSplit ? (
                                <div className="text-sm font-medium">
                                  {watchAmount && numberOfParticipants > 0 
                                    ? formatCurrency(parseFloat(watchAmount) / numberOfParticipants) 
                                    : '$0.00'}
                                </div>
                              ) : (
                                <Input 
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={participant.share}
                                  onChange={(e) => {
                                    const updatedParticipants = [...form.getValues("participants")];
                                    updatedParticipants[index].share = parseFloat(e.target.value) || 0;
                                    form.setValue("participants", updatedParticipants);
                                  }}
                                  className="h-8"
                                />
                              )
                            ) : (
                              <div className="text-sm text-muted-foreground">$0.00</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/expenses")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Expense"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseForm;
