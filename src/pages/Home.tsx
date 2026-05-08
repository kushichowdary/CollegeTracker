import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, IndianRupee, Star, Briefcase } from 'lucide-react';

interface College {
  id: string;
  name: string;
  location: string;
  fees: number;
  rating: number;
  placement_percent: number;
  description: string;
}

export default function Home() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [feesFilter, setFeesFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [searchTerm, locationFilter, feesFilter]);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      if (data.locations) {
        setLocations(data.locations);
      }
    } catch (err) {
      console.error('Failed to fetch locations', err);
    }
  };

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      if (feesFilter) params.append('maxFees', feesFilter);
      
      const res = await fetch(`/api/colleges?${params}`);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Search Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">Find your dream college</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search colleges by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-700"
            />
          </div>
          <div className="md:w-56 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none text-slate-700"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="md:w-56 relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select 
              value={feesFilter}
              onChange={(e) => setFeesFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none text-slate-700"
            >
              <option value="">Any Fees</option>
              <option value="100000">Under 1 Lakh</option>
              <option value="200000">Under 2 Lakhs</option>
              <option value="300000">Under 3 Lakhs</option>
              <option value="500000">Under 5 Lakhs</option>
            </select>
          </div>
        </div>
      </div>

      {/* College List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">
            {colleges.length} {colleges.length === 1 ? 'Result' : 'Results'} found
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl h-48 border border-slate-100 shadow-sm animate-pulse flex flex-col justify-between p-6">
                 <div className="w-2/3 h-6 bg-slate-200 rounded mb-4" />
                 <div className="w-1/2 h-4 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : colleges.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {colleges.map((college) => (
              <Link to={`/college/${college.id}`} key={college.id} className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all hover:border-orange-200">
                <div className="p-6 flex flex-col h-full flex-1">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No colleges found</h3>
            <p className="text-slate-500">Try adjusting your search criteria or location filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}
