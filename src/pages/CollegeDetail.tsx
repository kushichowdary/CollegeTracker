import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, IndianRupee, Star, Briefcase, GraduationCap, ArrowLeft, MessageSquare, BookmarkPlus, BookmarkMinus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CollegeDetails {
  college: {
    id: string;
    name: string;
    location: string;
    fees: number;
    rating: number;
    placement_percent: number;
    description: string;
  };
  courses: Array<{
    id: string;
    name: string;
    duration: string;
    fees: number;
    description?: string;
  }>;
  reviews: Array<{
    id: string;
    user_name: string;
    comment: string;
    rating: number;
  }>;
}

export default function CollegeDetail() {
  const { id } = useParams();
  const [data, setData] = useState<CollegeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/colleges/${id}`);
        if (!res.ok) throw new Error('Not found');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!user || !token || !id) return;
      try {
        const res = await fetch(`/api/saved`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const savedData = await res.json();
        if (savedData.colleges && savedData.colleges.find((c: any) => c.id === id)) {
          setIsSaved(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkSavedStatus();
  }, [id, user, token]);

  const toggleSave = async () => {
    if (!user || !token || !id) return;
    setSaving(true);
    try {
      if (isSaved) {
        await fetch(`/api/saved/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        setIsSaved(false);
      } else {
        await fetch(`/api/saved/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        setIsSaved(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!data || !data.college) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">College not found</h2>
        <Link to="/" className="text-orange-500 hover:underline mt-4 inline-block">Return to search</Link>
      </div>
    );
  }

  const { college, courses, reviews } = data;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Directory
      </Link>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" />
        
        {user && (
          <button 
            onClick={toggleSave}
            disabled={saving}
            className={`absolute top-6 right-6 p-3 rounded-full flex items-center justify-center transition-all border ${isSaved ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100' : 'bg-white border-slate-200 text-slate-500 hover:text-orange-500 hover:border-orange-200'}`}
            title={isSaved ? "Remove from saved" : "Save this college"}
          >
            {isSaved ? <BookmarkMinus className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
          </button>
        )}

        <div className="flex flex-col md:flex-row gap-6 justify-between items-start relative z-10 mt-4 md:mt-0 pr-12">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">{college.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium mb-6">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 opacity-70" /> {college.location}</span>
              <span className="flex items-center bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-100 text-sm">
                <Star className="w-3.5 h-3.5 fill-green-600 mr-1" /> {college.rating} Rating
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed max-w-3xl">
              {college.description}
            </p>
          </div>
          
          <div className="w-full md:w-auto flex flex-row md:flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 shrink-0">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Avg Fees</p>
              <p className="text-2xl font-bold text-slate-800 flex items-center">
                <IndianRupee className="w-5 h-5 mr-0.5" />
                {(college.fees / 100000).toFixed(1)} Lakhs
              </p>
            </div>
            <div className="hidden md:block w-px md:w-full h-full md:h-px bg-slate-200" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Placement Rate</p>
              <p className="text-2xl font-bold text-slate-800 flex items-center">
                <Briefcase className="w-5 h-5 mr-1.5 text-orange-500" />
                {college.placement_percent}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Courses */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-orange-500" />
              Courses Offered
            </h2>
            
            <div className="space-y-4">
              {courses.length > 0 ? courses.map(course => (
                <div key={course.id} className="flex flex-col sm:flex-row justify-between items-start p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg">{course.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-2 font-medium">Duration: {course.duration}</p>
                    {course.description && (
                      <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
                    )}
                  </div>
                  <div className="text-left sm:text-right bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 shrink-0">
                    <p className="text-xs uppercase text-slate-400 font-bold tracking-wide mb-0.5">Fees (Total)</p>
                    <p className="font-semibold text-slate-900 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                      {(course.fees / 100000).toFixed(2)} Lakhs
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 italic">No courses listed yet.</p>
              )}
            </div>
          </section>
        </div>
        
        {/* Right Col: Reviews */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-orange-400 to-orange-500" />
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-orange-500" />
              Student Reviews
            </h2>
            
            <div className="space-y-6">
              {reviews.length > 0 ? reviews.map(review => (
                <div key={review.id} className="border-t border-slate-100 first:border-0 first:pt-0 pt-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                         {review.user_name.charAt(0)}
                       </div>
                       <span className="font-semibold text-slate-800 text-sm">{review.user_name}</span>
                    </div>
                    <div className="flex text-orange-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(review.rating) ? 'fill-current' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed italic block">"{review.comment}"</p>
                </div>
              )) : (
                <p className="text-slate-500 italic text-sm">No reviews yet.</p>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
