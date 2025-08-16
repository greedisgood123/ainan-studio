import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <Label>Email</Label>
          <Input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          className="w-full"
          disabled={isLoading}
          onClick={async () => {
            setError("");
            const result = await login(email, password);
            if (result.success) {
              window.location.hash = "#/admin";
            } else {
              setError(result.error || "Login failed");
            }
          }}
        >
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </div>
    </div>
  );
};

export default Login;


