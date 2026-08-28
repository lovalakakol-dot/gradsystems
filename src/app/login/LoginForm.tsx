'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../../lib/supabase/client';
import { usernameToAuthEmail } from '../../features/auth/authEmail';
import { roleHomePath } from '../../features/auth/roleHomePath';
import InlineAlert from '../../shared/components/InlineAlert';

type LoginError =
  | { type: 'invalid_credentials' }
  | { type: 'inactive_account' }
  | { type: 'profile_missing' }
  | { type: 'unexpected'; message: string };

function errorMessage(error: LoginError): string {
  switch (error.type) {
    case 'invalid_credentials':
      return 'Username atau password salah.';
    case 'inactive_account':
      return 'Akun ini nonaktif. Hubungi Admin untuk mengaktifkan kembali.';
    case 'profile_missing':
      return 'Akun ditemukan tapi profil tidak lengkap. Hubungi Admin.';
    case 'unexpected':
      return 'Terjadi kesalahan tak terduga. Coba lagi sebentar lagi.';
  }
}

/* ───────────────────────────────────────────────
   Animation Variants — pure additions, no logic touched
   ─────────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94], // smooth ease-out
    },
  },
};

const shakeVariants = {
  shake: {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.4 },
  },
};

/* ───────────────────────────────────────────────
   LoginForm — logic 100 % preserved, only style & motion added
   ─────────────────────────────────────────────── */

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const cleanUsername = username.trim();

      const supabase = createClient();
      const email = usernameToAuthEmail(cleanUsername);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError({ type: 'invalid_credentials' });
        return;
      }

      if (!data.session) {
        setError({ type: 'unexpected', message: 'No session returned' });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.auth.signOut();
        setError({ type: 'profile_missing' });
        return;
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        setError({ type: 'inactive_account' });
        return;
      }

      router.refresh();
      router.push(roleHomePath(profile.role));
    } catch (err) {
      console.error('Unexpected error during login', err);
      setError({ type: 'unexpected', message: 'Unexpected error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative w-full max-w-md"
    >
      {/* ═══════ Glassmorphism Card ═══════ */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl shadow-[#7A1E33]/10"
      >
        {/* Top gradient accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#7A1E33] via-[#A53A52] to-[#7A1E33]" />

        <div className="px-8 py-8 sm:px-10 sm:py-10">
          {/* ── Header ── */}
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <motion.div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFFFF] to-[#e6b2b2] shadow-lg shadow-[#7A1E33]/67"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img 
              src="/logo.svg" 
              alt="Logo" 
              className="h-full w-full object-contain" 
              />  
            </motion.div>
            <motion.h2
              className="text-2xl font-bold tracking-tight text-[#7A1E33]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Selamat Datang
            </motion.h2>
            <motion.p
              className="mt-1 text-sm text-[#7A1E33]/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Wisuda Management Systems
            </motion.p>
            <motion.p
              className="mt-1 text-sm text-[#7A1E33]/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Masuk dengan akun kepanitiaan Anda
            </motion.p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* ── Username Field ── */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-semibold text-[#7A1E33]/80"
              >
                Username
              </label>
              <motion.div
                className="relative"
                animate={focusedField === 'username' ? { scale: 1.01 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full rounded-xl border-2 border-[#7A1E33]/10 bg-white/50 px-4 py-3 text-[#7A1E33] placeholder-[#7A1E33]/30 transition-all duration-300 focus:border-[#7A1E33] focus:bg-white focus:shadow-lg focus:shadow-[#7A1E33]/10 focus:outline-none focus:ring-0 disabled:opacity-50"
                  placeholder="Masukkan username"
                  required
                  disabled={isSubmitting}
                />
                {/* Animated underline on focus */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 rounded-full bg-gradient-to-r from-[#7A1E33] to-[#A53A52]"
                  initial={{ width: '0%' }}
                  animate={{ width: focusedField === 'username' ? '100%' : '0%' }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              </motion.div>
            </motion.div>

            {/* ── Password Field ── */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-[#7A1E33]/80"
              >
                Password
              </label>
              <motion.div
                className="relative"
                animate={focusedField === 'password' ? { scale: 1.01 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full rounded-xl border-2 border-[#7A1E33]/10 bg-white/50 px-4 py-3 pr-12 text-[#7A1E33] placeholder-[#7A1E33]/30 transition-all duration-300 focus:border-[#7A1E33] focus:bg-white focus:shadow-lg focus:shadow-[#7A1E33]/10 focus:outline-none focus:ring-0 disabled:opacity-50"
                  placeholder="Masukkan password"
                  required
                  disabled={isSubmitting}
                />

                {/* Eye toggle with rotate animation */}
                <motion.button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#7A1E33]/40 transition-colors hover:text-[#7A1E33] focus:outline-none"
                  tabIndex={-1}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.div
                        key="eyeoff"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="sr-only">
                    {showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  </span>
                </motion.button>

                {/* Animated underline on focus */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 rounded-full bg-gradient-to-r from-[#7A1E33] to-[#A53A52]"
                  initial={{ width: '0%' }}
                  animate={{ width: focusedField === 'password' ? '100%' : '0%' }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              </motion.div>
            </motion.div>

            {/* ── Error Alert with shake ── */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  variants={shakeVariants}
                  animate="shake"
                  initial={{ opacity: 0, height: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <InlineAlert message={errorMessage(error)} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Submit Button ── */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#7A1E33] to-[#8B2A42] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#7A1E33]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#7A1E33]/35 disabled:opacity-60 disabled:shadow-none"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {/* Shine sweep effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />

                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2.5"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Memproses...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2.5"
                    >
                      <LogIn className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      <span>Masuk</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>
        </div>

        {/* ── Footer strip ── */}
        <div className="bg-gradient-to-r from-[#7A1E33]/5 via-[#A53A52]/5 to-[#7A1E33]/5 px-8 py-4 sm:px-10">
          <p className="text-center text-xs text-[#7A1E33]/50">
            Sistem Terlindungi oleh HPIM Mesir 
          </p>
        </div>
      </motion.div>

      {/* ═══════ Ambient glow orbs (background decoration) ═══════ */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-[#7A1E33]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[#A53A52]/10 blur-3xl" />
    </motion.div>
  );
}