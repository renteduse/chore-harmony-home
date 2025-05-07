
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListCheck, DollarSign, Calendar, Users, Home } from "lucide-react";

const features = [
  {
    icon: <Home className="h-6 w-6 text-rentmate-primary" />,
    title: "Household Management",
    description: "Create or join a household with your roommates using a simple invite code system.",
  },
  {
    icon: <ListCheck className="h-6 w-6 text-rentmate-primary" />,
    title: "Chore Rotation",
    description: "Schedule and assign recurring chores for your household with automatic rotation.",
  },
  {
    icon: <DollarSign className="h-6 w-6 text-rentmate-primary" />,
    title: "Expense Sharing",
    description: "Log shared expenses and see who owes what with automatic splitting calculations.",
  },
  {
    icon: <Calendar className="h-6 w-6 text-rentmate-primary" />,
    title: "Calendar View",
    description: "See all chores and expenses in a unified calendar with color-coded entries.",
  },
  {
    icon: <Users className="h-6 w-6 text-rentmate-primary" />,
    title: "Roommate Balances",
    description: "Track who's owed what with a simple balance dashboard and settlement suggestions.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <header className="bg-gradient-to-r from-rentmate-primary to-rentmate-tertiary text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                RentMate
              </h1>
              <p className="text-xl md:text-2xl mb-6">
                The hassle-free way for roommates to manage chores and split expenses.
              </p>
              <div className="space-x-4">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-rentmate-primary hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/placeholder.svg" 
                alt="RentMate App Preview" 
                className="rounded-lg shadow-xl" 
                width="600"
                height="400"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to manage your shared living space</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-rentmate-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your roommate life?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join RentMate today and say goodbye to roommate conflicts over chores and bills.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-rentmate-primary hover:bg-gray-100">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">RentMate</h3>
              <p className="text-gray-400">Roommate Chore & Expense Scheduler</p>
            </div>
            <div className="flex space-x-4">
              <Link to="/login" className="text-gray-400 hover:text-white">
                Login
              </Link>
              <Link to="/register" className="text-gray-400 hover:text-white">
                Register
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} RentMate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
