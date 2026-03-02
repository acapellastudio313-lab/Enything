import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CheckCircle, X, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function Candidates({ user }: { user: any }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // 1. Ambil data kandidat secara Real-time
    const unsub = onSnapshot(collection(db, 'candidates'), (snap) => {
      setCandidates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // 2. Cek apakah user ini sudah pernah memilih sebelumnya
    const checkUserVote = async () => {
      const voteDoc = await getDoc(doc(db, 'votes', user.id));
      if (voteDoc.exists()) setHasVoted(true);
    };

    checkUserVote();
    return () => unsub();
  }, [user.id]);

  const handleVote = async (candidateId: string) => {
    try {
      // Tambah suara ke kandidat
      await updateDoc(doc(db, 'candidates', candidateId), {
        vote_count: increment(1)
      });

      // Tandai user sudah memilih agar tidak bisa vote 2 kali
      await setDoc(doc(db, 'votes', user.id), {
        candidateId,
        votedAt: new Date().toISOString(),
        username: user.username
      });

      setHasVoted(true);
      setSelected(null);
      toast.success("Suara Anda berhasil dikirim!");
    } catch (error) {
      toast.error("Gagal mengirim suara. Cek koneksi Anda.");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Memuat Kandidat...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black">E-Voting</h1>
          <p className="opacity-90 font-medium mt-1">Pilih Agen Perubahan Terbaik</p>
        </div>
        <Award className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 rotate-12" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {candidates.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                {c.avatar ? <img src={c.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : <User size={28} />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{c.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{c.position || 'Kandidat'}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelected(c)}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm"
            >
              Detail
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="bg-white w-full max-w-lg rounded-[3rem] p-8 relative shadow-2xl"
            >
              <button onClick={() => setSelected(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"><X size={20}/></button>
              
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] mx-auto mb-4 flex items-center justify-center text-emerald-600">
                  <User size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-800">{selected.name}</h2>
                <p className="text-emerald-600 font-bold mt-1">Visi & Misi</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] mb-8">
                <p className="text-slate-600 text-sm leading-relaxed text-center italic">
                  "{selected.vision || "Berkomitmen penuh untuk memberikan perubahan positif bagi Pengadilan Agama Prabumulih."}"
                </p>
              </div>

              <button 
                disabled={hasVoted}
                onClick={() => handleVote(selected.id)}
                className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
                  hasVoted ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {hasVoted ? "Anda Sudah Memilih" : (
                  <>Konfirmasi Pilihan <CheckCircle size={20}/></>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
