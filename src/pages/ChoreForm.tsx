
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHousehold } from "@/contexts/HouseholdContext";
import { ChoreFrequency } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

// Schema for form validation
const choreFormSchema = z.object({
  name: z.string().min(1, { message: "Chore name is required" }),
  description: z.string().optional(),
  frequency: z.enum([
    ChoreFrequency.DAILY, 
    ChoreFrequency.WEEKLY, 
    ChoreFrequency.BIWEEKLY, 
    ChoreFrequency.MONTHLY
  ]),
  assignedTo: z.string().min(1, { message: "Please assign this chore to someone" }),
  nextDueDate: z.date({
    required_error: "Please select a due date",
  }),
});

type ChoreFormData = z.infer<typeof choreFormSchema>;

const ChoreForm = () => {
  const navigate = useNavigate();
  const { household, members } = useHousehold();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<ChoreFormData>({
    resolver: zodResolver(choreFormSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: ChoreFrequency.WEEKLY,
      nextDueDate: new Date(),
    },
  });

  const onSubmit = async (data: ChoreFormData) => {
    if (!household) {
      toast.error("You need to be part of a household to create chores");
      return;
    }

    setIsSubmitting(true);
    try {
      // Add householdId to the chore data
      const choreData = {
        ...data,
        householdId: household._id,
      };

      await api.chores.create(choreData);
      toast.success("Chore created successfully");
      navigate("/chores");
    } catch (error) {
      console.error("Failed to create chore:", error);
      toast.error("Failed to create chore");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!household) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Household Found</h1>
          <p className="mb-4">You need to be part of a household to create chores.</p>
          <Button onClick={() => navigate("/household-setup")}>
            Set Up Household
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Chore</h1>
        <p className="text-muted-foreground">Add a new chore to your household rotation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Chore Details</CardTitle>
          <CardDescription>Define the chore and assign it to a household member</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chore Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Take out trash" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a clear and concise name for the chore
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any details or specific instructions" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include any special instructions or details
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ChoreFrequency.DAILY}>Daily</SelectItem>
                          <SelectItem value={ChoreFrequency.WEEKLY}>Weekly</SelectItem>
                          <SelectItem value={ChoreFrequency.BIWEEKLY}>Bi-weekly</SelectItem>
                          <SelectItem value={ChoreFrequency.MONTHLY}>Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often this chore needs to be done
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select household member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.map(member => (
                            <SelectItem key={member._id} value={member._id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Who is responsible for this chore
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="nextDueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Next Due Date</FormLabel>
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
                      When this chore needs to be completed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/chores")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Chore"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChoreForm;
