import { useState, useEffect } from 'react';
import { Search, IndianRupee, MapPin, Briefcase, Star, X } from 'lucide-react';

interface College {
  id: string;
  name: string;
  location: string;
  fees: number;
  rating: number;
  placement_percent: number;
}

export default function Compare() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<College[]>([]);
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);

  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/colleges?search=${query}&limit=5`);
        const json = await res.json();
        setSearchResults(json.colleges || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const handleAdd = (college: College) => {
    if (selectedColleges.length < 3 && !selectedColleges.find(c => c.id === college.id)) {
      setSelectedColleges([...selectedColleges, college]);
    }
    setQuery('');
    setSearchResults([]);
  };

  const handleRemove = (id: string) => {
    setSelectedColleges(selectedColleges.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Compare Colleges</h1>
        <p className="text-slate-500 text-lg">Select up to 3 colleges side-by-side to make the right decision for your future.</p>
      </div>

      {/* Selector */}
      <div className="max-w-xl mx-auto relative z-20">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={selectedColleges.length >= 3 ? "Maximum 3 colleges selected" : "Search to add a college..."}
            disabled={selectedColleges.length >= 3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium text-slate-800 disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>
        
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden drop-shadow-sm">
             {searchResults.map(college => (
               <button 
                 key={college.id}
                 onClick={() => handleAdd(college)}
                 className="w-full text-left px-5 py-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center group transition-colors"
               >
                 <div>
                   <p className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">{college.name}</p>
                   <p className="text-xs text-slate-500 flex items-center mt-1"><MapPin className="w-3 h-3 mr-1" /> {college.location}</p>
                 </div>
                 <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Add</span>
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Comparison Area */}
      <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-10">
        {selectedColleges.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-xl font-medium text-slate-500">No colleges selected yet.</p>
            <p className="text-sm mt-2">Search and select starting from the bar above.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-4 w-1/4 border-b border-slate-100 align-top">
                     <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider">Features</span>
                  </th>
                  {selectedColleges.map(college => (
                    <th key={college.id} className="p-4 w-1/4 border-b border-slate-100 align-top relative group">
                      <div className="pr-8">
                        <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2">{college.name}</h3>
                        <p className="text-xs font-normal text-slate-500 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {college.location}</p>
                      </div>
                      <button 
                        onClick={() => handleRemove(college.id)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded-full p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </th>
                  ))}
                  {/* Empty headers for < 3 colleges */}
                  {Array.from({ length: 3 - selectedColleges.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-4 w-1/4 border-b border-slate-100 align-top text-center opacity-50">
                      <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center py-8 bg-slate-50">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Add College</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 py-6 font-semibold text-slate-600 bg-slate-50/50">Average Fees</td>
                  {selectedColleges.map(college => (
                    <td key={college.id} className="p-4 py-6 font-bold text-slate-800">
                      <div className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-1 text-slate-400" />
                        {(college.fees / 100000).toFixed(2)} Lakhs/yr
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedColleges.length }).map((_, i) => <td key={i} className="p-4 bg-slate-50/20"></td>)}
                </tr>
                <tr>
                  <td className="p-4 py-6 font-semibold text-slate-600 bg-slate-50/50">Placement Rate</td>
                  {selectedColleges.map(college => (
                    <td key={college.id} className="p-4 py-6 font-bold text-slate-800">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                        {college.placement_percent}%
                        {college.placement_percent > 90 && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded">High</span>}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedColleges.length }).map((_, i) => <td key={i} className="p-4 bg-slate-50/20"></td>)}
                </tr>
                <tr>
                  <td className="p-4 py-6 font-semibold text-slate-600 bg-slate-50/50">Student Rating</td>
                  {selectedColleges.map(college => (
                    <td key={college.id} className="p-4 py-6">
                       <div className="flex items-center gap-2">
                        <div className="flex text-orange-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(college.rating) ? 'fill-current' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <span className="font-bold text-slate-800">{college.rating}<span className="text-slate-400 font-normal text-xs ml-0.5">/5</span></span>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedColleges.length }).map((_, i) => <td key={i} className="p-4 bg-slate-50/20"></td>)}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
