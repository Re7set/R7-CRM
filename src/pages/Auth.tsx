import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Auth() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await signIn(password);
    if (!ok) {
      setError('Mot de passe incorrect');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl shadow-lg mb-4 bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 overflow-hidden">
            {/* Try to load logo.png, fallback to text logo if not found */}
            <img src="/logo.png" alt="R7 Logo" className="w-full h-full object-cover" onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }} />
            <span className="r7-gradient-text text-4xl font-black tracking-tight hidden">R7</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RE7SET</h1>
          <p className="text-sm text-white/60 mt-1">Sales CRM</p>
        </div>

        <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
                autoComplete="current-password"
                className={`h-11 text-sm rounded-xl bg-secondary/50 border-border/50 placeholder:text-muted-foreground/50 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {error && <p className="text-xs text-destructive font-medium text-center">{error}</p>}
            </div>
            <Button type="submit" className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-md">
              Se connecter
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-white/30 mt-6">RE7SET &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
