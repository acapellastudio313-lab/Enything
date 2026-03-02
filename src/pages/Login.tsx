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
      // 1. Cari user berdasarkan username di Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Username tidak ditemukan");
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // 2. Verifikasi Password (Sederhana untuk internal)
      if (userData.password === password) {
        onLogin({
          id: userDoc.id,
          ...userData
        });
        toast.success("Berhasil masuk!");
      } else {
        toast.error("Password salah!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal terhubung ke database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Pemilihan Agen Perubahan</h1>
          <p className="text-sm text-slate-500 mt-2">PA Prabumulih Online</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold"
              placeholder="Contoh: admin"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold"
              placeholder="••••••"
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-[0.98]"
          >
            {loading ? "Mengecek Data..." : "Masuk Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}
