import { User } from '../types';
import { useState, FormEvent } from 'react';
import { UserPlus, ArrowLeft, Loader2, LogIn } from 'lucide-react';
import { auth, db } from '../firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface LoginProps { onLogin: (user: User) => void; }

export default function Login({ onLogin }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', bio: '' });
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const branding = { 
    name: 'Pemilihan Agen Perubahan', 
    subtitle: 'Pengadilan Agama Prabumulih', 
    logo: '' 
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const email = loginData.username.includes('@') ? loginData.username : `${loginData.username}@enything.com`;
      const userCredential = await signInWithEmailAndPassword(auth, email, loginData.password);
      onLogin({
        id: userCredential.user.uid,
        name: userCredential.user.displayName || loginData.username,
        username: loginData.username,
        role: 'admin' 
      });
    } catch (err: any) {
      setError('Username atau Password salah.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const email = `${formData.username}@enything.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        role: 'user'
      });
      alert('Pendaftaran berhasil! Silakan Login.');
      setIsRegistering(false);
    } catch (err: any) {
      setError('Gagal mendaftar. Username mungkin sudah digunakan.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">{branding.name}</h2>
        <p className="mt-2 text-sm text-slate-600">{branding.subtitle}</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-10 shadow rounded-lg">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <input type="text" placeholder="Nama Lengkap" required className="w-full border p-2 rounded" 
                onChange={e => setFormData({...formData, name: e.target.value})} />
            )}
            <input type="text" placeholder="Username" required className="w-full border p-2 rounded" 
              onChange={e => isRegistering ? setFormData({...formData, username: e.target.value}) : setLoginData({...loginData, username: e.target.value})} />
            <input type="password" placeholder="Password" required className="w-full border p-2 rounded" 
              onChange={e => isRegistering ? setFormData({...formData, password: e.target.value}) : setLoginData({...loginData, password: e.target.value})} />
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700 flex justify-center">
              {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Daftar' : 'Masuk')}
            </button>
            <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="w-full text-sm text-slate-500 underline text-center">
              {isRegistering ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}