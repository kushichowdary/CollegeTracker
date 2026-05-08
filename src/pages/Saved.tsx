import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, IndianRupee, Star, Briefcase, BookmarkMinus, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface College {
  id: string;
  name: string;
  location: string;
  fees: number;
  rating: number;
  placement_percent: number;
  description: string;
}

export default function Saved() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
      return;
    }

    if (token) {
      fetchColleges();
    }
  }, [user, token, navigate]);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.colleges) {
        setColleges(data.colleges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/saved/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setColleges(colleges.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to remove saved college");
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 animate-in fade-in">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl h-48 border border-slate-100 shadow-sm animate-pulse m-6" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Saved Colleges</h1>
        <p className="text-slate-500">Your personalized shortlist of colleges for comparison and reference.</p>
      </div>

      {colleges.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {colleges.map((college) => (
            <Link to={`/college/${college.id}`} key={college.id} className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all hover:border-orange-200 relative">
              <button 
                onClick={(e) => handleRemove(e, college.id)}
                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-slate-400 hover:text-red-500 hover:shadow shadow-sm z-10 transition-colors backdrop-blur-sm border border-slate-100"
                title="Remove from saved"
              >
                <BookmarkMinus className="w-5 h-5" />
              </button>
              
              <div className="p-6 flex flex-col h-full flex-1 pt-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 pr-4">{college.name}</h3>
                  <div className="flex items-center bg-green-50 px-2.5 py-1 rounded-md border border-green-100 shrink-0">
                    <Star className="w-3.5 h-3.5 text-green-600 fill-green-600 mr-1" />
                    <span className="text-sm font-semibold text-green-700">{college.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-slate-500 mb-6 text-sm">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {college.location}
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Avg. Fees</p>
                    <p className="font-semibold text-slate-800 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                      {(college.fees / 100000).toFixed(1)} L/yr
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Placement</p>
                    <p className="font-semibold text-slate-800 flex items-center">
                      <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {college.placement_percent}%
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Compass className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">No saved colleges</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">You haven't added any colleges to your shortlist yet. Discover colleges and save them to view later.</p>
          <Link to="/" className="inline-flex items-center justify-center bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
            Discover Colleges
          </Link>
        </div>
      )}
    </div>
  );
}
