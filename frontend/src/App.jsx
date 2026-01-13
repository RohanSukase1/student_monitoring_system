import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { FaUserGraduate, FaUserCheck, FaUserTimes, FaCircle, FaFingerprint } from 'react-icons/fa';
import { MdOutlineFactCheck, MdSettingsRemote } from 'react-icons/md';

// Static flow data for the chart
const liveFlow = [
  { time: '08:00', in: 45 }, { time: '08:30', in: 68 }, { time: '09:00', in: 95 },
  { time: '09:30', in: 120 }, { time: '10:00', in: 75 }, { time: '10:30', in: 50 }
];

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('live');
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());
  
  // 1. LIVE DATA STATE
  const [counts, setCounts] = useState({
    is_online: 0,
    student_count: 0,
    shirt_tucked: 0,
    shirt_untucked: 0,
    id_card_yes: 0,
    id_card_no: 0
  });

  // 2. FETCH LOGIC
  const fetchCounts = async () => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500);

      const response = await fetch('http://127.0.0.1:5000/count', { 
        signal: controller.signal 
      });
      clearTimeout(id);

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setCounts({ ...data, is_online: 1 });

    } catch (error) {
      setCounts({
        is_online: 0,
        student_count: 0,
        shirt_tucked: 0,
        shirt_untucked: 0,
        id_card_yes: 0,
        id_card_no: 0
      });
      console.warn("Flask Server is disconnected.");
    }
  };

  // Timer for clock and Fetch Interval
  useEffect(() => {
    // Update clock every second
    const timer = setInterval(() => setTimestamp(new Date().toLocaleTimeString()), 1000);
    
    // Initial fetch
    fetchCounts();

    // Data polling every 2 seconds
    const interval = setInterval(fetchCounts, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, []);

  // 3. DYNAMIC DATA ARRAYS
  const disciplinedData = [
    { feature: 'ID Card', value: counts.id_card_yes, color: '#10b981' },
    { feature: 'Shirt Tucked', value: counts.shirt_tucked, color: '#6ee7b7' },
    { feature: 'Total Flow', value: counts.student_count, color: '#3b82f6' }
  ];

  const unDisciplinedData = [
    { feature: 'No ID', value: counts.id_card_no, color: '#f43f5e' },
    { feature: 'Un-tucked', value: counts.shirt_untucked, color: '#fb7185' },
    { feature: 'Total Violations', value: counts.id_card_no + counts.shirt_untucked, color: '#e11d48' }
  ];

  return (
    <div className="min-h-screen bg-[#030306] text-slate-100 p-6 md:p-12 font-['Poppins'] tracking-tight">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&family=JetBrains+Mono:wght@500&display=swap');
        @keyframes scan { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .glass-panel { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .bg-glow { position: fixed; width: 50vw; height: 50vw; border-radius: 50%; filter: blur(120px); z-index: -1; opacity: 0.15; transition: all 1.5s ease; }
      `}} />

      <div className="bg-glow -top-24 -left-24" style={{ 
        backgroundColor: currentPage === 'live' ? '#3b82f6' : currentPage === 'disciplined' ? '#10b981' : '#f43f5e' 
      }} />

      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center mb-12 gap-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-2xl shadow-blue-500/20">
            <MdSettingsRemote size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">
              AI-Based <span className="font-light text-blue-400">SMART STUDENT MONITORING SYSTEM</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold tracking-[0.4em] uppercase mt-1">
              {timestamp} // STATUS: {' '}
              <span className={counts.is_online === 1 ? "text-emerald-400" : "text-rose-500"}>
                {counts.is_online === 1 ? "ONLINE" : "OFFLINE"}
              </span>
            </p>
          </div>
        </div>

        <nav className="flex p-1.5 glass-panel rounded-2xl">
          <NavBtn active={currentPage === 'live'} label="Live Window" onClick={() => setCurrentPage('live')} />
          <NavBtn active={currentPage === 'disciplined'} label="Disciplined" onClick={() => setCurrentPage('disciplined')} />
          <NavBtn active={currentPage === 'undisciplined'} label="Un-Disciplined" onClick={() => setCurrentPage('undisciplined')} />
        </nav>
      </header>

      {/* KEY METRICS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard label="Total Inflow" count={counts.student_count} icon={<FaUserGraduate/>} accent="#3b82f6" />
        <StatCard label="ID Verified" count={counts.id_card_yes} icon={<FaUserCheck/>} accent="#10b981" />
        <StatCard label="Violations" count={counts.id_card_no + counts.shirt_untucked} icon={<FaUserTimes/>} accent="#f43f5e" />
      </div>

      <main className="max-w-7xl mx-auto">
        {currentPage === 'live' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* CAMERA FEED */}
            <div className="lg:col-span-5 relative glass-panel rounded-[2.5rem] overflow-hidden h-[500px]">
              {counts.is_online === 1 ? (
                <>
                  <img 
                    
  src="http://127.0.0.1:5000/video_feed"
  alt="AI Feed"
/>

                  
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-[scan_4s_ease-in-out_infinite] z-10" />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-bold tracking-widest animate-pulse uppercase text-xs">
                    Disconnected
                  </p>
                </div>
              )}
              
              <div className="absolute top-8 left-8 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <FaCircle className={counts.is_online === 1 ? "text-emerald-500 animate-pulse text-[10px]" : "text-rose-500 text-[10px]"} />
                <span className="text-[10px] font-bold tracking-widest text-white uppercase">CAMERA_01</span>
              </div>
              
              <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 z-20">
                <p className="text-[10px] font-bold text-blue-400 tracking-[0.2em] mb-4 uppercase">System Log</p>
                <div className="space-y-2 font-['JetBrains_Mono'] text-[12px] text-blue-100/50">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>[ID_CARD]</span>
                    <span className={counts.id_card_no > 0 ? "text-rose-400" : "text-emerald-400"}>
                      {counts.id_card_yes} PASS / {counts.id_card_no} FAIL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>[SHIRT]</span>
                    <span className="text-emerald-400">{counts.shirt_tucked} TUCKED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CHART */}
            <div className="lg:col-span-7 glass-panel rounded-[2.5rem] p-10 flex flex-col">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-12">Live Entry Analytics</h3>
               <div className="flex-grow">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={liveFlow}>
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis hide />
                      <Tooltip contentStyle={{backgroundColor: '#050508', border: '1px solid #ffffff10', borderRadius: '16px'}} />
                      <Area type="monotone" dataKey="in" stroke="#3b82f6" strokeWidth={4} fill="url(#blueGrad)" dot={{fill: '#3b82f6', r: 4}} />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-700">
            <div className="glass-panel rounded-[3rem] p-12 shadow-2xl">
              <h2 className={`text-3xl font-extrabold mb-12 tracking-tight uppercase ${currentPage === 'disciplined' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentPage === 'disciplined' ? 'Compliance Overview' : 'Violation Stats'}
              </h2>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentPage === 'disciplined' ? disciplinedData : unDisciplinedData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: '600'}} width={110} />
                    <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={32}>
                      {(currentPage === 'disciplined' ? disciplinedData : unDisciplinedData).map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex flex-col justify-center gap-4">
              {(currentPage === 'disciplined' ? disciplinedData : unDisciplinedData).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-8 glass-panel rounded-3xl hover:bg-white/[0.06] transition-all">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                      <MdOutlineFactCheck size={26}/>
                    </div>
                    <span className="font-bold text-sm uppercase tracking-widest text-slate-300">{item.feature}</span>
                  </div>
                  <span className="text-4xl font-extrabold tracking-tighter" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const NavBtn = ({ active, label, onClick }) => (
  <button onClick={onClick} className={`px-10 py-3.5 rounded-xl text-[11px] font-extrabold uppercase tracking-[0.2em] transition-all duration-500
    ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-slate-200'}`}>
    {label}
  </button>
);

const StatCard = ({ label, count, icon, accent }) => (
  <div className="glass-panel p-8 rounded-[2.5rem] flex items-center justify-between transition-all hover:-translate-y-1">
    <div>
      <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mb-1">{label}</p>
      <p className="text-6xl font-extrabold tracking-tighter" style={{ color: accent }}>{count}</p>
    </div>
    <div className="text-5xl opacity-10" style={{ color: accent }}>{icon}</div>
  </div>
);

export default Dashboard;