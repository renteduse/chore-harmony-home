
import { useState, useEffect } from "react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { api } from "@/services/api";
import { CalendarEvent } from "@/types";
import { Link } from "react-router-dom";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, DollarSign, ListCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CalendarView = () => {
  const { household, members } = useHousehold();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"month" | "list">("month");

  useEffect(() => {
    if (!household) return;

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const start = format(startOfMonth(currentDate), "yyyy-MM-dd");
        const end = format(endOfMonth(currentDate), "yyyy-MM-dd");
        
        const response = await api.calendar.getEvents(household._id, start, end);
        setEvents(response.data);
      } catch (error) {
        toast.error("Failed to load calendar events");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [household, currentDate]);

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Get the events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start), day)
    );
  };

  // Group events by day for list view
  const eventsByDay: { [key: string]: CalendarEvent[] } = {};
  events.forEach(event => {
    const dateKey = format(new Date(event.start), 'yyyy-MM-dd');
    if (!eventsByDay[dateKey]) {
      eventsByDay[dateKey] = [];
    }
    eventsByDay[dateKey].push(event);
  });

  // Sort days by date
  const sortedDays = Object.keys(eventsByDay).sort();

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

  const getUserById = (userId: string) => {
    return members.find(m => m._id === userId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View upcoming chores and expenses</p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(value) => setView(value as "month" | "list")} className="mr-4">
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Link to="/chores/new">
            <Button variant="outline">
              <ListCheck className="mr-2 h-4 w-4" />
              Add Chore
            </Button>
          </Link>
          <Link to="/expenses/new">
            <Button>
              <DollarSign className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading calendar events...</div>
      ) : (
        <TabsContent value="month" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 gap-px border">
                {/* Day names */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div 
                    key={day} 
                    className="h-12 p-2 font-medium text-center bg-muted/50"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {daysInMonth.map((day, index) => {
                  const dayEvents = getEventsForDay(day);
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "min-h-28 p-2 border-t border-l first:border-l-0",
                        !isSameMonth(day, currentDate) && "bg-muted/20 text-muted-foreground",
                        isToday(day) && "bg-blue-50"
                      )}
                    >
                      <div className="flex justify-between">
                        <span 
                          className={cn(
                            "inline-block w-6 h-6 text-center",
                            isToday(day) && "bg-primary text-primary-foreground rounded-full"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                        {dayEvents.map((event) => (
                          <div 
                            key={event.id} 
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              event.type === "chore" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            )}
                            title={`${event.title} - ${getUserById(event.resourceId)}`}
                          >
                            {event.type === "chore" ? <ListCheck className="inline-block h-3 w-3 mr-1" /> : <DollarSign className="inline-block h-3 w-3 mr-1" />}
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}

      <TabsContent value="list" className="mt-0">
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center">Loading events...</div>
            ) : sortedDays.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-lg font-medium">No events this month</h3>
                <p className="text-muted-foreground mt-2">Add chores or expenses to see them in the calendar</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDays.map(dateKey => {
                  const date = new Date(dateKey);
                  return (
                    <div key={dateKey} className="space-y-2">
                      <h3 className="font-semibold">
                        {isToday(date) ? "Today" : format(date, "EEEE, MMMM d")}
                      </h3>
                      <div className="space-y-2">
                        {eventsByDay[dateKey].map(event => (
                          <div 
                            key={event.id} 
                            className={cn(
                              "p-3 rounded-md",
                              event.type === "chore" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                            )}
                          >
                            <div className="flex justify-between">
                              <div className="font-medium">{event.title}</div>
                              {event.type === "chore" ? 
                                <Badge variant="outline" className="bg-green-100">Chore</Badge> : 
                                <Badge variant="outline" className="bg-red-100">Expense</Badge>
                              }
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Assigned to: {getUserById(event.resourceId)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
};

export default CalendarView;
