import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0A10] px-4 selection:bg-blue-500/30">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/20 blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] text-right -right-[20%] w-[60vw] h-[60vw] rounded-full bg-violet-600/20 blur-[150px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[380px] relative z-10"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-24 h-24 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.3)] mb-6 bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img src="/logo.png" alt="R7 Logo" className="w-16 h-16 object-cover z-10" onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }} />
            <span className="r7-gradient-text text-5xl font-black tracking-tighter hidden z-10">R7</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-wide">RE7SET</h1>
          <p className="text-sm font-medium text-white/40 tracking-[0.2em] uppercase mt-2">Sales CRM</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel rounded-3xl p-8 space-y-6 bg-black/40 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/50 ml-1">Master Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
                autoComplete="current-password"
                className={`h-12 text-sm rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all ${error ? 'border-red-500/50 focus-visible:ring-red-500/50' : ''}`}
              />
              {error && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-red-400 font-medium text-center pt-1">
                  {error}
                </motion.p>
              )}
            </div>
            <Button type="submit" className="w-full h-12 text-sm font-bold tracking-wide rounded-xl bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300">
              Connexion Secure
            </Button>
          </form>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-center text-[10px] uppercase tracking-widest text-white/20 mt-8 font-medium"
        >
          RE7SET &copy; {new Date().getFullYear()} &middot; Top 1% Design
        </motion.p>
      </motion.div>
    </div>
  );
}
