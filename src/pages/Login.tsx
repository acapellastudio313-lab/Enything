import { User } from '../types';
import { useState, FormEvent, useEffect } from 'react';
import { UserPlus, ArrowLeft, Loader2, LogIn } from 'lucide-react';
// Import Firebase SDK
import { auth, db } from '../firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', bio: '' });
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Default branding agar tidak kosong saat fetch API gagal
  const [branding, setBranding] = useState({ 
    name: 'Pemilihan Agen Perubahan', 
    subtitle: 'Pengadilan Agama Prabumulih', 
    logo: '' 
  });

  // Ambil data branding dari Firestore (Pengganti /api/settings/general)
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBranding({
            name: data.appName || 'Pemilihan Agen Perubahan',
            subtitle: data.appSubtitle || 'Pengadilan Agama Prabumulih',
            logo: data.appLogoUrl || ''
          });
        }
      } catch (err) {
        console.error('Gagal mengambil branding, menggunakan default.', err);
      }
    };
    fetchBranding();
  }, []);

  const handleLoginSuccess = (user: User) => {
    localStorage.setItem('userId', user.id.toString());
    onLogin(user);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Firebase butuh format email. Jika input username Anda 'admin', 
      // pastikan di Firebase Auth user tersebut terdaftar sebagai 'admin@email.com'
      // Atau modifikasi input agar menerima email langsung.
      const email = loginData.username.includes('@') ? loginData.username : `${loginData.username}@enything.com`;
      
      const userCredential = await signInWithEmailAndPassword(auth, email, loginData.password);
      const firebaseUser = userCredential.user;

      // Ambil data tambahan dari Firestore jika ada
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();

      const user: User = {
        id: firebaseUser.uid,
        name: userData?.name || firebaseUser.displayName || 'User',
        username: loginData.username,
        role: userData?.role || 'user',
        bio: userData?.bio || ''
      };

      handleLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      setError('Username atau Password salah.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const email = `${formData.username}@enything.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
      const user = userCredential.user;

      // Update Profile di Auth
      await updateProfile(user, { displayName: formData.name });

      // Simpan data tambahan ke Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        role: 'user', // Default role setelah daftar
        createdAt: new Date().toISOString()
      });

      setSuccessMsg('Pendaftaran berhasil! Silakan masuk.');
      setIsRegistering(false);
      setFormData({ name: '', username: '', password: '', bio: '' });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {branding.logo && (
          <div className="flex justify-center mb-4">
            <img src={branding.logo} alt="Logo" className="h-20 w-auto object-contain" />
          </div>
        )}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          {branding.name}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {branding.subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="flex items-center mb-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsRegistering(false);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-medium text-slate-900 ml-2">Daftar Akun Baru</h3>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Username</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Bio (Opsional)</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Daftar Sekarang'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900 text-center mb-4">Login ke Akun Anda</h3>
              
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm text-center">
                  {successMsg}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Username / Email</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  value={loginData.username}
                  onChange={e => setLoginData({...loginData, username: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Masuk
                  </>
                )}
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Atau</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                  setSuccessMsg('');
                }}
                className="w-full flex justify-center items-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Daftar Baru
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
