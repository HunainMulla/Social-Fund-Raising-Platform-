import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../components/ui/use-toast";
import { Shield, UserPlus } from "lucide-react";

const AdminSetup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMakeAdmin = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/auth/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        setEmail("");
      } else {
        throw new Error(data.message || "Failed to make user admin");
      }
    } catch (error) {
      console.error("Error making admin:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make user admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Admin Setup</CardTitle>
          <p className="text-sm text-gray-600">
            Make a user an admin for testing purposes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              User Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleMakeAdmin()}
            />
          </div>
          <Button 
            onClick={handleMakeAdmin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Making Admin...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Make Admin
              </div>
            )}
          </Button>
          <div className="text-xs text-gray-500 text-center">
            This will give the user full admin privileges to access the admin panel.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup; 