import { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Cari user di koleksi 'users' berdasarkan field 'username'
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Username tidak ditemukan di database");
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // 2. Cek apakah password cocok
      if (userData.password === password) {
        onLogin({
          id: userDoc.id,
          ...userData
        });
        toast.success("Berhasil masuk! Selamat datang.");
      } else {
        toast.error("Password salah. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Koneksi gagal. Pastikan Firebase Rules sudah 'allow read'.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800">Masuk Akun</h2>
          <p className="text-sm text-slate-500">Gunakan Username dan Password Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 outline-none transition-all"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••"
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
          >
            {loading ? "Menghubungkan..." : "Masuk Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}
