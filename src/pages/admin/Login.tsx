import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useMutation(api.auth.login);

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
          onClick={async () => {
            setError("");
            try {
              const res = await login({ email, password });
              localStorage.setItem("admin_token", res.token);
              window.location.hash = "#/admin";
            } catch (e: any) {
              setError(e?.message ?? "Login failed");
            }
          }}
        >
          Log in
        </Button>
      </div>
    </div>
  );
};

export default Login;


