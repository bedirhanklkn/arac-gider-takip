import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("filo_saved_email") || "";
    }
    return "";
  });
  const [password, setPassword] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("filo_saved_password") || "";
    }
    return "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("filo_saved_email") ? true : false;
    }
    return false;
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Hatalı e-posta veya şifre.");
    } else {
      if (rememberMe) {
        localStorage.setItem("filo_saved_email", email);
        localStorage.setItem("filo_saved_password", password);
      } else {
        localStorage.removeItem("filo_saved_email");
        localStorage.removeItem("filo_saved_password");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[128px]" />

      <Card className="w-full max-w-md bg-card/40 backdrop-blur-xl border-white/10 shadow-2xl z-10">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight gradient-text">FiloTakip</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sisteme giriş yapın veya yeni hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresi</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 h-11"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1 pb-1">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-background/50 accent-primary cursor-pointer"
              />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer select-none">
                Beni Hatırla
              </Label>
            </div>

            {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">{error}</div>}

            <div className="pt-2 flex flex-col gap-3">
              <Button type="submit" disabled={loading} className="w-full h-11 shadow-lg shadow-primary/20">
                {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
