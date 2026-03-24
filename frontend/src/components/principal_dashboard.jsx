// import React, { useState, useEffect, memo } from 'react';
// import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
// import { FaUserGraduate, FaUserCheck, FaUserTimes, FaCircle, FaUserTie, FaUserSecret, FaChartBar, FaUsers, FaArrowUp, FaIdCard, FaTshirt, FaSave, FaCog, FaDatabase, FaEdit, FaPercent } from 'react-icons/fa';
// import { MdSettingsRemote, MdAssignmentLate, MdReportProblem, MdTrendingUp, MdCheckCircle, MdCancel, MdGroups, MdArrowBack, MdTableChart, MdInsights } from 'react-icons/md';

// // --- CONSTANTS: DEPT METADATA (Static IDs/Colors only) ---
// const DEPT_METADATA = {
//   AIML: { name: 'AI & ML', fullName: 'Artificial Intelligence', color: '#3b82f6' }, // Blue
//   COMP: { name: 'Comp Eng', fullName: 'Computer Engineering', color: '#8b5cf6' },   // Violet (Adjusted for better light contrast)
//   ENTC: { name: 'ENTC', fullName: 'E & TC Engineering', color: '#f43f5e' }          // Rose
// };

// // --- SUB-COMPONENTS ---

// const LiveClock = () => {
//   const [time, setTime] = useState(new Date().toLocaleTimeString());
//   useEffect(() => {
//     const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
//     return () => clearInterval(timer);
//   }, []);
//   return <>{time}</>;
// };

// const NavBtn = memo(({ active, label, onClick }) => (
//   <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.15em] transition-all duration-300 relative overflow-hidden group
//     ${active 
//       ? 'bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)]' 
//       : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'}`}>
//     <span className="relative z-10">{label}</span>
//   </button>
// ));

// const StatCard = memo(({ label, count, icon, accent, outline = false }) => (
//   <div className={`relative overflow-hidden transition-all hover:-translate-y-1 duration-300 group
//     ${outline 
//         ? 'border-2 border-slate-200 bg-slate-50/50 p-5 flex flex-col items-center justify-center h-full rounded-[2rem]' 
//         : 'p-8 rounded-[2.5rem] flex items-center justify-between hover:shadow-xl bg-white border border-slate-100 shadow-sm'
//     }`}>
//     <div className={`absolute pointer-events-none transition-all duration-500
//         ${outline 
//             ? '-right-6 -top-6 text-8xl opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12' 
//             : 'text-5xl lg:text-6xl opacity-10 relative z-10'}`} 
//         style={{ color: accent }}>
//         {icon}
//     </div>

//     <div className={`relative z-10 ${outline ? 'text-center w-full' : ''}`}>
//       {outline && (
//           <div className="mb-2 opacity-100" style={{ color: accent }}>{icon}</div>
//       )}
//       <p className={`font-black tracking-tighter leading-none ${outline ? 'text-5xl xl:text-6xl mb-2' : 'text-5xl lg:text-6xl'}`} 
//          style={{ color: accent }}>
//          {count}
//       </p>
//       <p className={`font-bold text-slate-400 uppercase tracking-[0.2em] ${outline ? 'text-[9px]' : 'text-[10px] mb-2'}`}>
//         {label}
//       </p>
//     </div>
//   </div>
// ));

// const MegaStatCard = memo(({ label, count, icon, color }) => (
//   <div className="bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-8 rounded-[2.5rem] flex items-center justify-between relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
//     <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-[100%] transition-opacity"></div>
//     <div className="relative z-10">
//       <div className="flex items-center gap-2 mb-3">
//         <div className="p-2 rounded-lg bg-slate-100" style={{ color }}>{icon}</div>
//         <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">{label}</p>
//       </div>
//       <p className="text-5xl font-black tracking-tighter text-slate-800 group-hover:scale-105 transition-transform origin-left">{count}</p>
//     </div>
//     <div className="absolute -right-6 -bottom-6 text-9xl opacity-5 rotate-12 transition-all group-hover:rotate-0 group-hover:scale-110" style={{ color }}>{icon}</div>
//   </div>
// ));

// const GridStat = memo(({ label, value, icon, color }) => (
//     <div className="stat-grid-item flex flex-col justify-between h-32 group cursor-default">
//         <div className="flex justify-between items-start">
//             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">{label}</span>
//             <div style={{ color: color }} className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform drop-shadow-sm">{icon}</div>
//         </div>
//         <div className="flex items-end gap-2">
//             <span className="text-4xl font-bold text-slate-700 tracking-tighter">{value}</span>
//             <span className="mb-1.5"><MdTrendingUp className="text-emerald-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300" /></span>
//         </div>
//     </div>
// ));

// const Dashboard = () => {
//   const [currentPage, setCurrentPage] = useState('live');
//   const [isSaving, setIsSaving] = useState(false);

//   // --- STATE: SETTINGS (Total Strength) ---
//   const [settings, setSettings] = useState({
//     AIML: 640, COMP: 720, ENTC: 580
//   });

//   // --- STATE: LIVE DATA ---
//   const [liveData, setLiveData] = useState({
//     is_online: 0,
//     student_count: 0, live_count: 0, staff_count: 0,
//     disciplined: 0, undisciplined: 0,
//     id_card_yes: 0, id_card_no: 0,
//     shirt_tucked: 0, shirt_untucked: 0,
//     face_recognized: 0, face_unrecognized: 0,
//     departments: {
//       AIML: { recognized: 0, violations: 0, complaints: 0, breakdown: [] },
//       COMP: { recognized: 0, violations: 0, complaints: 0, breakdown: [] },
//       ENTC: { recognized: 0, violations: 0, complaints: 0, breakdown: [] }
//     }
//   });

//   // --- STATE: ENTRY GRAPH DATA ---
//   const [entryGraphData, setEntryGraphData] = useState(
//     Array.from({ length: 10 }, (_, i) => ({ time: `00:0${i}`, count: 0 }))
//   );

//   // --- FETCH COUNTS ---
//   const fetchCounts = async () => {
//     try {
//       const controller = new AbortController();
//       const id = setTimeout(() => controller.abort(), 900);
//       const response = await fetch('http://127.0.0.1:5000/count', { signal: controller.signal });
//       clearTimeout(id);

//       if (!response.ok) throw new Error("Server error");
//       const data = await response.json();
      
//       setLiveData(prev => ({ 
//         ...prev, 
//         is_online: 1,
//         live_count: data.live_flow || 0,
//         student_count: data.total_scanned || 0,
//         disciplined: data.disciplined_total || 0,
//         undisciplined: data.undisciplined_total || 0,
//         id_card_yes: data.id_card_yes_total || 0,
//         id_card_no: data.id_card_no_total || 0,
//         shirt_tucked: data.tucked_total || 0,
//         shirt_untucked: data.untucked_total || 0,
//         face_recognized: data.recognized_total || 0,
//         face_unrecognized: data.unrecognized || 0,
//         staff_count: data.staff_total || 0,
//         departments: {
//             AIML: { 
//                 recognized: data.recognized_an || 0,
//                 violations: data.undisciplined_an || 0,
//                 complaints: 0, 
//                 breakdown: [
//                     { attribute: 'No ID', count: data.id_card_no_an || 0 },
//                     { attribute: 'Untucked', count: data.untucked_an || 0 }
//                 ]
//             },
//             COMP: { 
//                 recognized: data.recognized_co || 0,
//                 violations: data.undisciplined_co || 0,
//                 complaints: 0,
//                 breakdown: [
//                     { attribute: 'No ID', count: data.id_card_no_co || 0 },
//                     { attribute: 'Untucked', count: data.untucked_co || 0 }
//                 ]
//             },
//             ENTC: { 
//                 recognized: data.recognized_et || 0,
//                 violations: data.undisciplined_et || 0,
//                 complaints: 0,
//                 breakdown: [
//                     { attribute: 'No ID', count: data.id_card_no_et || 0 },
//                     { attribute: 'Untucked', count: data.untucked_et || 0 }
//                 ]
//             }
//         }
//       }));
//     } catch (error) {
//       setLiveData(prev => ({ ...prev, is_online: 0 }));
//     }
//   };

//   const fetchEntryHistory = async () => {
//     try {
//         const response = await fetch('http://127.0.0.1:5000/entry'); 
//         if (response.ok) {
//             const data = await response.json();
//             if (Array.isArray(data) && data.length > 0) {
//                 setEntryGraphData(data);
//             }
//         }
//     } catch (e) { }
//   };

//   useEffect(() => {
//     fetchCounts();
//     fetchEntryHistory();
//     const intervalCounts = setInterval(fetchCounts, 1000);
//     const intervalEntry = setInterval(fetchEntryHistory, 1000); 
//     return () => { clearInterval(intervalCounts); clearInterval(intervalEntry); };
//   }, []);

//   const handleSaveSettings = async () => {
//     setIsSaving(true);
//     try {
//       await fetch('http://127.0.0.1:5000/api/update_strength', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(settings)
//       });
//       setTimeout(() => { setIsSaving(false); setCurrentPage('analytics'); }, 800);
//     } catch (e) { setIsSaving(false); }
//   };

//   const globalDisciplineRate = liveData.student_count > 0 
//     ? Math.round((liveData.disciplined / liveData.student_count) * 100) 
//     : 0;

//   // --- CHART MAPPINGS ---
//   const disciplinedData = [
//     { feature: 'ID Card', value: liveData.id_card_yes, color: '#10b981', icon: <FaIdCard/> },
//     { feature: 'Proper Dress', value: liveData.shirt_tucked, color: '#3b82f6', icon: <FaUserTie/> },
//     { feature: 'Tucked In', value: liveData.shirt_tucked, color: '#8b5cf6', icon: <FaTshirt/> },
//     { feature: 'Formal Shoes', value: liveData.student_count, color: '#f59e0b', icon: <FaArrowUp className="rotate-45"/> }
//   ];

//   const unDisciplinedData = [
//     { feature: 'No ID Card', value: liveData.id_card_no, color: '#f43f5e', icon: <FaIdCard/> },
//     { feature: 'Wrong Color', value: liveData.shirt_untucked, color: '#fb7185', icon: <FaUserTie/> },
//     { feature: 'Untucked', value: liveData.shirt_untucked, color: '#e11d48', icon: <FaTshirt/> },
//     { feature: 'Casual Shoes', value: (liveData.student_count || 0) * 0.1, color: '#be123c', icon: <FaArrowUp className="rotate-180"/> }
//   ];

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-['Poppins'] tracking-tight selection:bg-blue-200 selection:text-blue-900">
//       <style dangerouslySetInnerHTML={{ __html: `
//         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=JetBrains+Mono:wght@500&display=swap');
//         @keyframes scan { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
//         /* Light Theme Classes */
//         .glass-panel { background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
//         .glass-panel-heavy { background: #ffffff; border: 1px solid #cbd5e1; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); }
//         .bg-glow { position: fixed; width: 60vw; height: 60vw; border-radius: 50%; filter: blur(120px); z-index: -1; opacity: 0.07; transition: all 1.5s ease; pointer-events: none; mix-blend-mode: multiply; }
//         .stat-grid-item { background: #f8fafc; border-radius: 16px; padding: 16px; border: 1px solid #f1f5f9; transition: all 0.3s ease; }
//         .stat-grid-item:hover { background: #ffffff; border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
//         .table-row-hover:hover { background: #f1f5f9; }
//         .input-light { background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b; padding: 12px; border-radius: 12px; font-family: 'JetBrains Mono'; transition: all 0.3s; }
//         .input-light:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); outline: none; }
//       `}} />

//       {/* Static Background Glows - Adjusted opacity for light theme */}
//       <div className="bg-glow -top-24 -left-24" style={{ backgroundColor: currentPage === 'live' ? '#bfdbfe' : currentPage === 'disciplined' ? '#bbf7d0' : currentPage === 'analytics' ? '#e9d5ff' : '#fecdd3' }} />
//       <div className="bg-glow -bottom-24 -right-24" style={{ backgroundColor: currentPage === 'live' ? '#bfdbfe' : currentPage === 'disciplined' ? '#bbf7d0' : currentPage === 'analytics' ? '#e9d5ff' : '#fecdd3' }} />

//       {/* HEADER */}
//       <header className="max-w-[1600px] mx-auto flex flex-col xl:flex-row justify-between items-center mb-10 gap-8">
//         <div className="flex items-center gap-6">
//           <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
//             <MdSettingsRemote size={32} />
//           </div>
//           <div>
//             <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 uppercase">
//               AI Based <span className="font-light text-blue-600">Student Monitoring</span>
//             </h1>
//             <p className="text-[11px] text-slate-500 font-semibold tracking-[0.4em] uppercase mt-2">
//               <LiveClock /> // SYS: {' '}
//               <span className={liveData.is_online === 1 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
//                 {liveData.is_online === 1 ? "ONLINE" : "OFFLINE"}
//               </span>
//             </p>
//           </div>
//         </div>

//         <nav className="flex p-2 bg-white rounded-2xl gap-2 shadow-sm border border-slate-200">
//           <NavBtn active={currentPage === 'live'} label="Live Feed" onClick={() => setCurrentPage('live')} />
//           <NavBtn active={currentPage === 'disciplined'} label="Disciplined" onClick={() => setCurrentPage('disciplined')} />
//           <NavBtn active={currentPage === 'undisciplined'} label="Undisciplined" onClick={() => setCurrentPage('undisciplined')} />
//           <NavBtn active={currentPage === 'analytics'} label="Analytics" onClick={() => setCurrentPage('analytics')} />
//           <button 
//              onClick={() => setCurrentPage('edit')}
//              className={`px-4 rounded-xl transition-all ${currentPage === 'edit' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
//              <FaCog />
//           </button>
//         </nav>
//       </header>

//       {/* MAIN CONTENT AREA */}
//       <main className="max-w-[1600px] mx-auto min-h-[80vh]">

//         {/* --- EDIT / CONFIGURATION PAGE --- */}
//         {currentPage === 'edit' && (
//              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto mt-6">
//                 <div className="glass-panel-heavy rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden bg-white">
//                     <div className="flex items-center justify-between mb-8">
//                         <div>
//                             <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
//                                 <MdTableChart className="text-blue-600"/> Database Config
//                             </h2>
//                             <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.25em] mt-1 pl-1">Update Department Strength & Parameters</p>
//                         </div>
//                         <button onClick={() => setCurrentPage('analytics')} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 border border-slate-200">
//                             <MdArrowBack className="text-lg" /> Return
//                         </button>
//                     </div>

//                     <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner">
//                         <table className="w-full text-left border-collapse">
//                             <thead>
//                                 <tr className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold border-b border-slate-200">
//                                     <th className="p-6">Department</th>
//                                     <th className="p-6">Code</th>
//                                     <th className="p-6">Total Strength</th>
//                                     <th className="p-6">Live Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-100 text-sm">
//                                 {Object.keys(DEPT_METADATA).map((key) => (
//                                     <tr key={key} className="table-row-hover transition-colors group">
//                                         <td className="p-6 font-bold text-slate-700 flex items-center gap-4">
//                                             <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: DEPT_METADATA[key].color}}></div>
//                                             {DEPT_METADATA[key].fullName}
//                                         </td>
//                                         <td className="p-6 text-slate-400 font-mono text-xs">{key}</td>
//                                         <td className="p-6">
//                                             <div className="flex items-center gap-2">
//                                                 <input 
//                                                     type="number"
//                                                     className="input-light w-32 font-bold"
//                                                     value={settings[key]}
//                                                     onChange={(e) => setSettings({...settings, [key]: parseInt(e.target.value) || 0})}
//                                                 />
//                                                 <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Students</span>
//                                             </div>
//                                         </td>
//                                         <td className="p-6">
//                                             {liveData.departments[key]?.recognized > 0 ? (
//                                                 <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
//                                                     <FaCircle size={6} className="animate-pulse"/> 
//                                                     <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
//                                                 </div>
//                                             ) : (
//                                                 <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg w-fit border border-slate-200">
//                                                     <FaCircle size={6}/> 
//                                                     <span className="text-[10px] font-bold uppercase tracking-wider">Idle</span>
//                                                 </div>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     <div className="mt-8 flex justify-end">
//                         <button 
//                             onClick={handleSaveSettings}
//                             disabled={isSaving}
//                             className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold tracking-[0.15em] uppercase flex items-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
//                             {isSaving ? (
//                                 <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Updating DB...</>
//                             ) : (
//                                 <><FaSave /> Save Changes</>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//              </div>
//         )}

//         {/* --- PAGE 1: LIVE WINDOW --- */}
//         {currentPage === 'live' && (
//           <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            
//             {/* Top Grid: Video (Dominant) + Side Stats */}
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[750px]">
                
//                 {/* 1. Large Video Feed (Spans 9 columns) */}
//                 <div className="lg:col-span-9 relative bg-black rounded-[2.5rem] overflow-hidden h-full shadow-2xl border border-slate-300 group">
//                     {liveData.is_online === 1 ? (
//                         <>
//                         <img src="http://127.0.0.1:5000/video_feed" alt="AI Feed" className="w-full h-full object-cover opacity-90" />
//                         <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500 shadow-[0_0_30px_#3b82f6] animate-[scan_3s_ease-in-out_infinite] z-10" />
//                         </>
//                     ) : (
//                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
//                         <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-6"></div>
//                         <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-sm">Signal Lost</p>
//                         </div>
//                     )}
//                     <div className="absolute top-8 left-8 z-20 flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
//                         <FaCircle className={liveData.is_online === 1 ? "text-emerald-500 animate-pulse text-[10px]" : "text-rose-500 text-[10px]"} />
//                         <span className="text-[10px] font-bold tracking-widest text-slate-800 uppercase">Main_Gate_01</span>
//                     </div>
//                 </div>
                
//                 {/* 2. Side Stats (Stacked) */}
//                 <div className="lg:col-span-3 flex flex-col gap-5 h-full">
//                   <div className="flex-1">
//                     <StatCard outline={true} label="Live Flow" count={liveData.live_count} icon={<FaArrowUp/>} accent="#3b82f6" />
//                   </div>
//                   <div className="flex-1">
//                     <StatCard outline={true} label="Total Unique" count={liveData.student_count} icon={<FaUsers/>} accent="#8b5cf6" />
//                   </div>
//                   <div className="flex-1">
//                     <StatCard outline={true} label="Disciplined" count={liveData.disciplined} icon={<FaUserCheck/>} accent="#10b981" />
//                   </div>
//                   {/* NEW: Discipline Percentage Rate */}
//                   <div className="flex-1 glass-panel border border-emerald-100 p-5 rounded-[2rem] flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white">
//                       <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-600"><FaPercent size={40}/></div>
//                       <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Discipline Rate</span>
//                       <span className="text-6xl font-black text-slate-800 tracking-tighter">{globalDisciplineRate}<span className="text-2xl text-slate-400 font-bold">%</span></span>
//                       <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden">
//                           <div className="h-full bg-emerald-500 shadow-sm" style={{width: `${globalDisciplineRate}%`}}></div>
//                       </div>
//                   </div>
//                 </div>
//             </div>

//             {/* Bottom Row: Full Width Dynamic Graph */}
//             <div className="w-full glass-panel-heavy rounded-[2.5rem] p-8 h-[400px] relative mt-4 bg-white">
//                  <div className="absolute top-8 left-8 z-10">
//                     <h3 className="text-slate-700 font-bold uppercase tracking-wider flex items-center gap-3 text-lg">
//                         <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/30"><MdTrendingUp /></div> 
//                         Entry Traffic Analysis <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">/ENTRY API STREAM</span>
//                     </h3>
//                  </div>
//                  <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart data={entryGraphData} margin={{ top: 50, right: 0, left: 0, bottom: 0 }}>
//                         <defs>
//                             <linearGradient id="colorEntry" x1="0" y1="0" x2="0" y2="1">
//                                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
//                                 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                             </linearGradient>
//                         </defs>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
//                         <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
//                         <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
//                         <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', padding: '10px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} itemStyle={{color: '#1e293b'}} cursor={{stroke: '#3b82f6', strokeWidth: 2}} />
//                         <Area 
//                             type="monotone" 
//                             dataKey="count" 
//                             stroke="#3b82f6" 
//                             strokeWidth={3} 
//                             fillOpacity={1} 
//                             fill="url(#colorEntry)" 
//                             animationDuration={1500}
//                             isAnimationActive={true}
//                         />
//                     </AreaChart>
//                  </ResponsiveContainer>
//             </div>
//           </div>
//         )}

//         {/* --- PAGE 2 & 3: COMPLIANCE VIEW --- */}
//         {(currentPage === 'disciplined' || currentPage === 'undisciplined') && (
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in zoom-in-95 duration-700 h-auto lg:h-[70vh]">
//               <div className="lg:col-span-7 glass-panel-heavy rounded-[3rem] p-12 shadow-2xl flex flex-col bg-white">
//                 <div className="flex items-center gap-4 mb-10">
//                     <div className={`p-4 rounded-full ${currentPage === 'disciplined' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
//                         {currentPage === 'disciplined' ? <MdCheckCircle size={40}/> : <MdCancel size={40}/>}
//                     </div>
//                     <div>
//                         <h2 className={`text-4xl font-extrabold tracking-tight uppercase text-slate-800`}>
//                         {currentPage === 'disciplined' ? 'Disciplined' : 'Undisciplined'}
//                         </h2>
//                         <p className="text-slate-400 text-sm tracking-widest uppercase mt-1">
//                             {currentPage === 'disciplined' ? 'Compliance Metrics Breakdown' : 'Violation Metrics Breakdown'}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="flex-grow w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={currentPage === 'disciplined' ? disciplinedData : unDisciplinedData} layout="vertical" margin={{ left: 20, right: 20, bottom: 20 }}>
//                       <XAxis type="number" hide />
//                       <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: '700'}} width={120} />
//                       <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
//                       <Bar dataKey="value" radius={[0, 100, 100, 0]} barSize={40} animationDuration={1500}>
//                         {(currentPage === 'disciplined' ? disciplinedData : unDisciplinedData).map((entry, index) => (
//                           <Cell key={index} fill={entry.color} />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               <div className="lg:col-span-5 flex flex-col gap-5">
//                 <div className="grid grid-cols-2 gap-5 content-start flex-grow">
//                     {(currentPage === 'disciplined' ? disciplinedData : unDisciplinedData).map((item, i) => (
//                     <div key={i} className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between min-h-[160px] hover:border-slate-300 transition-all border-t-4 bg-white shadow-sm" style={{ borderTopColor: item.color }}>
//                         <div className="flex justify-between items-start">
//                             <div className="p-3 rounded-xl bg-slate-50 text-xl" style={{color: item.color}}>
//                                 {item.icon}
//                             </div>
//                         </div>
//                         <div>
//                             <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">{item.feature}</span>
//                             <span className="text-4xl font-black tracking-tighter text-slate-800">
//                                 {item.value}
//                             </span>
//                         </div>
//                     </div>
//                     ))}
//                 </div>

//                 <div className="glass-panel-heavy p-8 rounded-[2rem] flex items-center justify-between border-l-4 bg-white shadow-lg" 
//                      style={{ borderLeftColor: currentPage === 'disciplined' ? '#10b981' : '#f43f5e' }}>
//                     <div className="flex items-center gap-4">
//                           <div className={`p-4 rounded-xl ${currentPage === 'disciplined' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
//                              {currentPage === 'disciplined' ? <MdGroups size={32} /> : <MdReportProblem size={32} />}
//                           </div>
//                           <div>
//                             <p className="text-[10px] font-bold text-slate-400 tracking-[0.25em] uppercase mb-1">
//                                 Total {currentPage === 'disciplined' ? 'Disciplined' : 'Undisciplined'}
//                             </p>
//                             <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
//                                 {currentPage === 'disciplined' ? liveData.disciplined : liveData.undisciplined}
//                                 <span className="text-lg text-slate-400 ml-2 font-medium">/ {liveData.student_count}</span>
//                             </h3>
//                           </div>
//                     </div>
//                     <div className="text-xs font-bold tracking-widest bg-slate-100 px-4 py-2 rounded-lg text-slate-500 border border-slate-200">
//                         {liveData.student_count > 0 
//                             ? Math.round(((currentPage === 'disciplined' ? liveData.disciplined : liveData.undisciplined) / liveData.student_count) * 100) 
//                             : 0}%
//                     </div>
//                 </div>
//               </div>
//             </div>
//         )}

//         {/* --- PAGE 4: ANALYTICS --- */}
//         {currentPage === 'analytics' && (
//           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            
//             {/* Top Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//               <MegaStatCard label="Total Scanned" count={liveData.face_recognized + liveData.face_unrecognized} icon={<FaChartBar/>} color="#3b82f6" />
//               <MegaStatCard label="Recognized" count={liveData.face_recognized} icon={<FaUserGraduate/>} color="#10b981" />
//               <MegaStatCard label="Staff Detected" count={liveData.staff_count} icon={<FaUserTie/>} color="#a855f7" />
//               <MegaStatCard label="Unrecognized" count={liveData.face_unrecognized} icon={<FaUserSecret/>} color="#f43f5e" />
//             </div>

//             {/* Department Cards */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//               {Object.keys(DEPT_METADATA).map((deptCode, index) => {
//                 const meta = DEPT_METADATA[deptCode];
//                 const deptStats = liveData.departments[deptCode] || { recognized: 0, violations: 0, complaints: 0, breakdown: [] };
                
//                 // Calculate Department Discipline Percentage
//                 const deptTotal = deptStats.recognized || 0;
//                 const deptSafe = Math.max(0, deptTotal - deptStats.violations);
//                 const deptRate = deptTotal > 0 ? Math.round((deptSafe / deptTotal) * 100) : 0;

//                 return (
//                     <div key={index} className="glass-panel-heavy rounded-[3rem] p-8 flex flex-col hover:shadow-2xl transition-all duration-500 group relative overflow-hidden min-h-[650px] bg-white border border-slate-200">
//                     <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: meta.color }}></div>
                    
//                     {/* Header with Name + Circular Discipline Score */}
//                     <div className="flex justify-between items-start mb-8 relative z-10">
//                           <div className="flex flex-col gap-1">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-2 h-10 rounded-full" style={{ backgroundColor: meta.color }}></div>
//                                 <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">{meta.name}</h3>
//                             </div>
//                             <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] pl-5 font-bold">{meta.fullName}</p>
//                         </div>
                        
//                         {/* DEPT DISCIPLINE PERCENTAGE BADGE */}
//                         <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 border-slate-100 bg-white shadow-sm relative group-hover:scale-110 transition-transform">
//                              <span className="text-lg font-black text-slate-700">{deptRate}<span className="text-[8px]">%</span></span>
//                              <span className="text-[6px] font-bold uppercase tracking-widest text-slate-400">Score</span>
//                              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 rotate-45" style={{opacity: deptRate > 0 ? 1 : 0}}></div>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4 mb-10 flex-grow">
//                         <GridStat label="Total Strength" value={settings[deptCode]} icon={<FaUsers/>} color={meta.color} />
//                         <GridStat label="Recognized" value={deptStats.recognized} icon={<FaUserCheck/>} color="#10b981" />
//                         <GridStat label="Violations" value={deptStats.violations} icon={<FaUserTimes/>} color="#f43f5e" />
//                         <GridStat label="Complaints" value={deptStats.complaints} icon={<MdAssignmentLate/>} color="#fbbf24" />
//                     </div>

//                     <div className="h-[1px] bg-slate-100 w-full mb-8"></div>
                    
//                     <div className="flex justify-between items-center mb-6 px-1">
//                         <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-slate-400">Violation Breakdown</span>
//                         <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
//                             <MdReportProblem size={12} /> <span className="text-[9px] font-bold uppercase tracking-wider">Live</span>
//                         </div>
//                     </div>

//                     <div className="h-[240px] w-full">
//                         <ResponsiveContainer width="100%" height="100%">
//                             <BarChart data={deptStats.breakdown && deptStats.breakdown.length > 0 ? deptStats.breakdown : [{attribute:'None', count:0}]} margin={{top: 20, right: 10, left: -20, bottom: 0}}>
//                                 <defs>
//                                     <linearGradient id={`grad${index}`} x1="0" y1="0" x2="0" y2="1">
//                                         <stop offset="0%" stopColor={meta.color} stopOpacity={0.8}/>
//                                         <stop offset="100%" stopColor={meta.color} stopOpacity={0.2}/>
//                                     </linearGradient>
//                                 </defs>
//                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                                 <XAxis dataKey="attribute" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} dy={15} />
//                                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
//                                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
//                                 <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={45} fill={`url(#grad${index})`} />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>
//                     </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//       </main>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect, memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { FaUserGraduate, FaUserCheck, FaUserTimes, FaCircle, FaUserTie, FaUserSecret, FaChartBar, FaUsers, FaArrowUp, FaIdCard, FaTshirt, FaSave, FaCog, FaPercent } from 'react-icons/fa';
import { MdSettingsRemote, MdAssignmentLate, MdReportProblem, MdTrendingUp, MdCheckCircle, MdCancel, MdGroups, MdArrowBack, MdTableChart } from 'react-icons/md';

// --- CONSTANTS: DEPT METADATA (Static IDs/Colors only) ---
const DEPT_METADATA = {
  AIML: { name: 'AI & ML', fullName: 'Artificial Intelligence', color: '#3b82f6' },
  COMP: { name: 'Comp Eng', fullName: 'Computer Engineering', color: '#8b5cf6' },
  ENTC: { name: 'ENTC', fullName: 'E & TC Engineering', color: '#f43f5e' }
};

// --- SUB-COMPONENTS ---
const LiveClock = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <>{time}</>;
};

const NavBtn = memo(({ active, label, onClick }) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.15em] transition-all duration-300 relative overflow-hidden group
    ${active 
      ? 'bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)]' 
      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'}`}>
    <span className="relative z-10">{label}</span>
  </button>
));

const StatCard = memo(({ label, count, icon, accent, outline = false }) => (
  <div className={`relative overflow-hidden transition-all hover:-translate-y-1 duration-300 group
    ${outline 
        ? 'border-2 border-slate-200 bg-slate-50/50 p-5 flex flex-col items-center justify-center h-full rounded-[2rem]' 
        : 'p-8 rounded-[2.5rem] flex items-center justify-between hover:shadow-xl bg-white border border-slate-100 shadow-sm'
    }`}>
    <div className={`absolute pointer-events-none transition-all duration-500
        ${outline 
            ? '-right-6 -top-6 text-8xl opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12' 
            : 'text-5xl lg:text-6xl opacity-10 relative z-10'}`} 
        style={{ color: accent }}>
        {icon}
    </div>

    <div className={`relative z-10 ${outline ? 'text-center w-full' : ''}`}>
      {outline && (
          <div className="mb-2 opacity-100" style={{ color: accent }}>{icon}</div>
      )}
      <p className={`font-black tracking-tighter leading-none ${outline ? 'text-5xl xl:text-6xl mb-2' : 'text-5xl lg:text-6xl'}`} 
          style={{ color: accent }}>
          {count}
      </p>
      <p className={`font-bold text-slate-400 uppercase tracking-[0.2em] ${outline ? 'text-[9px]' : 'text-[10px] mb-2'}`}>
        {label}
      </p>
    </div>
  </div>
));

const MegaStatCard = memo(({ label, count, icon, color }) => (
  <div className="bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-8 rounded-[2.5rem] flex items-center justify-between relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
    <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-[100%] transition-opacity"></div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-slate-100" style={{ color }}>{icon}</div>
        <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">{label}</p>
      </div>
      <p className="text-5xl font-black tracking-tighter text-slate-800 group-hover:scale-105 transition-transform origin-left">{count}</p>
    </div>
    <div className="absolute -right-6 -bottom-6 text-9xl opacity-5 rotate-12 transition-all group-hover:rotate-0 group-hover:scale-110" style={{ color }}>{icon}</div>
  </div>
));

const GridStat = memo(({ label, value, icon, color }) => (
    <div className="stat-grid-item flex flex-col justify-between h-32 group cursor-default">
        <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">{label}</span>
            <div style={{ color: color }} className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform drop-shadow-sm">{icon}</div>
        </div>
        <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-700 tracking-tighter">{value}</span>
            <span className="mb-1.5"><MdTrendingUp className="text-emerald-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300" /></span>
        </div>
    </div>
));

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('live');
  const [isSaving, setIsSaving] = useState(false);

  // --- STATE: SETTINGS ---
  const [settings, setSettings] = useState({
    AIML: 640, COMP: 720, ENTC: 580
  });

  // --- STATE: LIVE DATA ---
  const [liveData, setLiveData] = useState({
    is_online: 0,
    student_count: 0, live_count: 0, staff_count: 0,
    disciplined: 0, undisciplined: 0,
    id_card_yes: 0, id_card_no: 0,
    shirt_tucked: 0, shirt_untucked: 0,
    proper_dress: 0, improper_dress: 0,
    face_recognized: 0, face_unrecognized: 0,
    departments: {
      AIML: { recognized: 0, violations: 0, complaints: 0, breakdown: [] },
      COMP: { recognized: 0, violations: 0, complaints: 0, breakdown: [] },
      ENTC: { recognized: 0, violations: 0, complaints: 0, breakdown: [] }
    }
  });

  const [entryGraphData, setEntryGraphData] = useState(
    Array.from({ length: 10 }, (_, i) => ({ time: `00:0${i}`, count: 0 }))
  );

  // --- FETCH COUNTS ---
  const fetchCounts = async () => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('http://localhost:5000/count', { signal: controller.signal });
      clearTimeout(id);

      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      
      setLiveData(prev => ({ 
        ...prev, 
        is_online: data.is_online !== undefined ? data.is_online : 1,
        live_count: data.live_flow || 0,
        student_count: data.total_scanned || 0,
        disciplined: data.disciplined_total || 0,
        undisciplined: data.undisciplined_total || 0,
        id_card_yes: data.id_card_yes_total || 0,
        id_card_no: data.id_card_no_total || 0,
        shirt_tucked: data.tucked_total || 0,
        shirt_untucked: data.untucked_total || 0,
        proper_dress: data.white_dress_total || 0, 
        improper_dress: data.improper_dress_total || 0, 
        face_recognized: data.recognized_total || 0,
        face_unrecognized: data.unrecognized || 0,
        staff_count: data.staff_total || 0,
        departments: {
            AIML: { 
                recognized: data.recognized_an || 0,
                violations: data.undisciplined_an || 0,
                complaints: 0, 
                breakdown: [
                    { attribute: 'No ID', count: data.id_card_no_an || 0 },
                    { attribute: 'Improper Uniform', count: data.improper_dress_an || 0 },
                    { attribute: 'Untucked', count: data.untucked_an || 0 }
                ]
            },
            COMP: { 
                recognized: data.recognized_co || 0,
                violations: data.undisciplined_co || 0,
                complaints: 0,
                breakdown: [
                    { attribute: 'No ID', count: data.id_card_no_co || 0 },
                    { attribute: 'Improper Uniform', count: data.improper_dress_co || 0 },
                    { attribute: 'Untucked', count: data.untucked_co || 0 }
                ]
            },
            ENTC: { 
                recognized: data.recognized_et || 0,
                violations: data.undisciplined_et || 0,
                complaints: 0,
                breakdown: [
                    { attribute: 'No ID', count: data.id_card_no_et || 0 },
                    { attribute: 'Improper Uniform', count: data.improper_dress_et || 0 },
                    { attribute: 'Untucked', count: data.untucked_et || 0 }
                ]
            }
        }
      }));
    } catch (error) {
      setLiveData(prev => ({ ...prev, is_online: 0 }));
    }
  };

  const fetchEntryHistory = async () => {
    try {
        const response = await fetch('http://localhost:5000/entries'); 
        if (response.ok) {
            const rawData = await response.json();
            if (Array.isArray(rawData) && rawData.length > 0) {
                const bucketMap = {};
                rawData.forEach(entry => {
                    if (entry.time) {
                        const [h, m] = entry.time.split(':').map(Number);
                        const roundedMin = Math.floor(m / 15) * 15;
                        const sortKey = `${h.toString().padStart(2, '0')}:${roundedMin.toString().padStart(2, '0')}`;
                        bucketMap[sortKey] = (bucketMap[sortKey] || 0) + 1;
                    }
                });

                const processedData = Object.keys(bucketMap)
                    .sort()
                    .map(sortKey => {
                        const [hStr, mStr] = sortKey.split(':');
                        let h = parseInt(hStr);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        h = h % 12;
                        h = h ? h : 12; 
                        
                        return { time: `${h.toString().padStart(2, '0')}:${mStr} ${ampm}`, count: bucketMap[sortKey] };
                    });
                
                if (processedData.length > 0) {
                    setEntryGraphData(processedData);
                }
            }
        }
    } catch (e) { }
  };

  useEffect(() => {
    fetchCounts();
    fetchEntryHistory();
    const intervalCounts = setInterval(fetchCounts, 1000);
    const intervalEntry = setInterval(fetchEntryHistory, 1000); 
    return () => { clearInterval(intervalCounts); clearInterval(intervalEntry); };
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await fetch('http://localhost:5000/api/update_strength', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setTimeout(() => { setIsSaving(false); setCurrentPage('analytics'); }, 800);
    } catch (e) { setIsSaving(false); }
  };

  const globalDisciplineRate = liveData.student_count > 0 
    ? Math.round((liveData.disciplined / liveData.student_count) * 100) 
    : 0;

  // --- CHART MAPPINGS (Shortened text for cleaner look) ---
  const disciplinedData = [
    { feature: 'ID Card', value: liveData.id_card_yes, color: '#10b981', icon: <FaIdCard/> },
    { feature: 'Uniform', value: liveData.proper_dress, color: '#10b981', icon: <FaUserTie/> },
    { feature: 'Tucked', value: liveData.shirt_tucked, color: '#10b981', icon: <FaTshirt/> }
  ];

  const unDisciplinedData = [
    { feature: 'No ID', value: liveData.id_card_no, color: '#f43f5e', icon: <FaIdCard/> },
    { feature: 'No Uniform', value: liveData.improper_dress, color: '#f43f5e', icon: <FaUserTie/> },
    { feature: 'Untucked', value: liveData.shirt_untucked, color: '#f43f5e', icon: <FaTshirt/> }
  ];

  const complianceChartData = [
    { feature: 'ID Card', compliant: liveData.id_card_yes, violating: liveData.id_card_no },
    { feature: 'Uniform', compliant: liveData.proper_dress, violating: liveData.improper_dress },
    { feature: 'Tucking', compliant: liveData.shirt_tucked, violating: liveData.shirt_untucked },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-['Poppins'] tracking-tight selection:bg-blue-200 selection:text-blue-900">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=JetBrains+Mono:wght@500&display=swap');
        @keyframes scan { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .glass-panel { background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
        .glass-panel-heavy { background: #ffffff; border: 1px solid #cbd5e1; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); }
        .bg-glow { position: fixed; width: 60vw; height: 60vw; border-radius: 50%; filter: blur(120px); z-index: -1; opacity: 0.07; transition: all 1.5s ease; pointer-events: none; mix-blend-mode: multiply; }
        .stat-grid-item { background: #f8fafc; border-radius: 16px; padding: 16px; border: 1px solid #f1f5f9; transition: all 0.3s ease; }
        .stat-grid-item:hover { background: #ffffff; border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        .table-row-hover:hover { background: #f1f5f9; }
        .input-light { background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b; padding: 12px; border-radius: 12px; font-family: 'JetBrains Mono'; transition: all 0.3s; }
        .input-light:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); outline: none; }
      `}} />

      <div className="bg-glow -top-24 -left-24" style={{ backgroundColor: currentPage === 'live' ? '#bfdbfe' : currentPage === 'compliance' ? '#bbf7d0' : currentPage === 'analytics' ? '#e9d5ff' : '#fecdd3' }} />
      <div className="bg-glow -bottom-24 -right-24" style={{ backgroundColor: currentPage === 'live' ? '#bfdbfe' : currentPage === 'compliance' ? '#bbf7d0' : currentPage === 'analytics' ? '#e9d5ff' : '#fecdd3' }} />

      {/* HEADER */}
      <header className="max-w-[1600px] mx-auto flex flex-col xl:flex-row justify-between items-center mb-10 gap-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
            <MdSettingsRemote size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 uppercase">
              AI Based <span className="font-light text-blue-600">Student Monitoring</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold tracking-[0.4em] uppercase mt-2">
              <LiveClock /> // SYS: {' '}
              <span className={liveData.is_online === 1 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                {liveData.is_online === 1 ? "ONLINE" : "OFFLINE"}
              </span>
            </p>
          </div>
        </div>

        <nav className="flex p-2 bg-white rounded-2xl gap-2 shadow-sm border border-slate-200">
          <NavBtn active={currentPage === 'live'} label="Live Feed" onClick={() => setCurrentPage('live')} />
          <NavBtn active={currentPage === 'compliance'} label="Compliance" onClick={() => setCurrentPage('compliance')} />
          <NavBtn active={currentPage === 'analytics'} label="Analytics" onClick={() => setCurrentPage('analytics')} />
          <button 
             onClick={() => setCurrentPage('edit')}
             className={`px-4 rounded-xl transition-all ${currentPage === 'edit' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
             <FaCog />
          </button>
        </nav>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-[1600px] mx-auto min-h-[80vh]">

        {/* --- EDIT / CONFIGURATION PAGE --- */}
        {currentPage === 'edit' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto mt-6">
                <div className="glass-panel-heavy rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                                <MdTableChart className="text-blue-600"/> Database Config
                            </h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.25em] mt-1 pl-1">Update Department Strength</p>
                        </div>
                        <button onClick={() => setCurrentPage('analytics')} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 border border-slate-200">
                            <MdArrowBack className="text-lg" /> Return
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold border-b border-slate-200">
                                    <th className="p-6">Department</th>
                                    <th className="p-6">Code</th>
                                    <th className="p-6">Total Strength</th>
                                    <th className="p-6">Live Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {Object.keys(DEPT_METADATA).map((key) => (
                                    <tr key={key} className="table-row-hover transition-colors group">
                                        <td className="p-6 font-bold text-slate-700 flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: DEPT_METADATA[key].color}}></div>
                                            {DEPT_METADATA[key].fullName}
                                        </td>
                                        <td className="p-6 text-slate-400 font-mono text-xs">{key}</td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number"
                                                    className="input-light w-32 font-bold"
                                                    value={settings[key]}
                                                    onChange={(e) => setSettings({...settings, [key]: parseInt(e.target.value) || 0})}
                                                />
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Students</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {liveData.departments[key]?.recognized > 0 ? (
                                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
                                                    <FaCircle size={6} className="animate-pulse"/> 
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg w-fit border border-slate-200">
                                                    <FaCircle size={6}/> 
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Idle</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold tracking-[0.15em] uppercase flex items-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSaving ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Updating DB...</>
                            ) : (
                                <><FaSave /> Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* --- PAGE 1: LIVE WINDOW --- */}
        {currentPage === 'live' && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[750px]">
                <div className="lg:col-span-9 relative bg-black rounded-[2.5rem] overflow-hidden h-full shadow-2xl border border-slate-300 group">
                    {liveData.is_online === 1 ? (
                        <>
                        <img src="http://localhost:5000/video_feed" alt="AI Feed" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500 shadow-[0_0_30px_#3b82f6] animate-[scan_3s_ease-in-out_infinite] z-10" />
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                        <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-sm">Signal Lost</p>
                        </div>
                    )}
                    <div className="absolute top-8 left-8 z-20 flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
                        <FaCircle className={liveData.is_online === 1 ? "text-emerald-500 animate-pulse text-[10px]" : "text-rose-500 text-[10px]"} />
                        <span className="text-[10px] font-bold tracking-widest text-slate-800 uppercase">Main_Gate_01</span>
                    </div>
                </div>
                
                <div className="lg:col-span-3 flex flex-col gap-5 h-full">
                  <div className="flex-1">
                    <StatCard outline={true} label="Live Flow" count={liveData.live_count} icon={<FaArrowUp/>} accent="#3b82f6" />
                  </div>
                  <div className="flex-1">
                    <StatCard outline={true} label="Total Unique" count={liveData.student_count} icon={<FaUsers/>} accent="#8b5cf6" />
                  </div>
                  <div className="flex-1">
                    <StatCard outline={true} label="Disciplined" count={liveData.disciplined} icon={<FaUserCheck/>} accent="#10b981" />
                  </div>
                  <div className="flex-1 glass-panel border border-emerald-100 p-5 rounded-[2rem] flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white">
                      <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-600"><FaPercent size={40}/></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Discipline Rate</span>
                      <span className="text-6xl font-black text-slate-800 tracking-tighter">{globalDisciplineRate}<span className="text-2xl text-slate-400 font-bold">%</span></span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden">
                          <div className="h-full bg-emerald-500 shadow-sm" style={{width: `${globalDisciplineRate}%`}}></div>
                      </div>
                  </div>
                </div>
            </div>

            <div className="w-full glass-panel-heavy rounded-[2.5rem] p-8 h-[400px] relative mt-4 bg-white">
                 <div className="absolute top-8 left-8 z-10">
                    <h3 className="text-slate-700 font-bold uppercase tracking-wider flex items-center gap-3 text-lg">
                        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/30"><MdTrendingUp /></div> 
                        Entry Traffic Analysis <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">/ENTRY API STREAM</span>
                    </h3>
                 </div>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={entryGraphData} margin={{ top: 50, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorEntry" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', padding: '10px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} itemStyle={{color: '#1e293b'}} cursor={{stroke: '#3b82f6', strokeWidth: 2}} />
                        <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorEntry)" 
                            animationDuration={1500}
                            isAnimationActive={true}
                        />
                    </AreaChart>
                 </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* --- MERGED PAGE: COMPLIANCE STATUS --- */}
        {currentPage === 'compliance' && (
            <div className="flex flex-col gap-10 animate-in zoom-in-95 duration-700 pb-20">
              
              {/* TOP HEADER ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Compliant Box */}
                <div className="glass-panel-heavy rounded-[3rem] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center bg-white border-l-8 border-emerald-500">
                  <div className="flex items-center gap-6">
                      <div className="p-5 rounded-2xl bg-emerald-100 text-emerald-600">
                          <MdCheckCircle size={48}/>
                      </div>
                      <div>
                          <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mt-1 mb-2">Compliant</p>
                          <h2 className="text-5xl font-black tracking-tighter text-slate-800">
                             {liveData.disciplined}
                             <span className="text-2xl text-slate-400 font-medium ml-3">/ {liveData.student_count}</span>
                          </h2>
                      </div>
                  </div>
                  <div className="mt-6 md:mt-0 text-right">
                     <div className="text-4xl font-black text-emerald-500">
                          {liveData.student_count > 0 ? Math.round((liveData.disciplined / liveData.student_count) * 100) : 0}%
                     </div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rate</div>
                  </div>
                </div>

                {/* Violating Box */}
                <div className="glass-panel-heavy rounded-[3rem] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center bg-white border-l-8 border-rose-500">
                  <div className="flex items-center gap-6">
                      <div className="p-5 rounded-2xl bg-rose-100 text-rose-600">
                          <MdCancel size={48}/>
                      </div>
                      <div>
                          <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mt-1 mb-2">Violations</p>
                          <h2 className="text-5xl font-black tracking-tighter text-slate-800">
                             {liveData.undisciplined}
                             <span className="text-2xl text-slate-400 font-medium ml-3">/ {liveData.student_count}</span>
                          </h2>
                      </div>
                  </div>
                  <div className="mt-6 md:mt-0 text-right">
                     <div className="text-4xl font-black text-rose-500">
                          {liveData.student_count > 0 ? Math.round((liveData.undisciplined / liveData.student_count) * 100) : 0}%
                     </div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rate</div>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: Breakdown Grids Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Compliant Grid */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-slate-500 font-bold text-sm uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
                        <FaCircle className="text-[8px] text-emerald-500"/> Compliant
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {disciplinedData.map((item, i) => (
                        <div key={i} className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-transform duration-300 border-t-4 bg-white" style={{ borderTopColor: item.color }}>
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-xl bg-slate-50 text-xl" style={{color: item.color}}>{item.icon}</div>
                                <div className="text-[10px] font-bold tracking-widest bg-slate-50 px-2 py-1 rounded text-slate-500">
                                   {(liveData.student_count > 0 ? ((item.value / liveData.student_count) * 100).toFixed(1) : 0)}%
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">{item.feature}</span>
                                <span className="text-4xl font-black tracking-tighter text-slate-800">{item.value}</span>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Violating Grid */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-slate-500 font-bold text-sm uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
                        <FaCircle className="text-[8px] text-rose-500"/> Violating
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {unDisciplinedData.map((item, i) => (
                        <div key={i} className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-transform duration-300 border-t-4 bg-white" style={{ borderTopColor: item.color }}>
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-xl bg-slate-50 text-xl" style={{color: item.color}}>{item.icon}</div>
                                <div className="text-[10px] font-bold tracking-widest bg-slate-50 px-2 py-1 rounded text-slate-500">
                                   {(liveData.student_count > 0 ? ((item.value / liveData.student_count) * 100).toFixed(1) : 0)}%
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">{item.feature}</span>
                                <span className="text-4xl font-black tracking-tighter text-slate-800">{item.value}</span>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
              </div>

              {/* BOTTOM ROW: Grouped Comparison Chart */}
              <div className="w-full glass-panel-heavy rounded-[2.5rem] p-10 h-[450px] bg-white mt-4">
                <div className="mb-8">
                    <h3 className="text-slate-800 text-xl font-black uppercase tracking-tight">Compliance vs Violations</h3>
                    <p className="text-slate-400 text-[11px] font-bold tracking-[0.2em] uppercase mt-1">Direct correlation across flow</p>
                </div>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={complianceChartData} margin={{ left: 0, right: 0, top: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="feature" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: '700'}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold'}} />
                    <Bar dataKey="compliant" name="Compliant" fill="#10b981" radius={[8, 8, 0, 0]} barSize={50} animationDuration={1500} />
                    <Bar dataKey="violating" name="Violation" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={50} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
        )}

        {/* --- PAGE 4: ANALYTICS --- */}
        {currentPage === 'analytics' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <MegaStatCard label="Total Scanned" count={liveData.face_recognized + liveData.face_unrecognized} icon={<FaChartBar/>} color="#3b82f6" />
              <MegaStatCard label="Recognized" count={liveData.face_recognized} icon={<FaUserGraduate/>} color="#10b981" />
              <MegaStatCard label="Staff Detected" count={liveData.staff_count} icon={<FaUserTie/>} color="#a855f7" />
              <MegaStatCard label="Unrecognized" count={liveData.face_unrecognized} icon={<FaUserSecret/>} color="#f43f5e" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Object.keys(DEPT_METADATA).map((deptCode, index) => {
                const meta = DEPT_METADATA[deptCode];
                const deptStats = liveData.departments[deptCode] || { recognized: 0, violations: 0, complaints: 0, breakdown: [] };
                
                const deptTotal = deptStats.recognized || 0;
                const deptSafe = Math.max(0, deptTotal - deptStats.violations);
                const deptRate = deptTotal > 0 ? Math.round((deptSafe / deptTotal) * 100) : 0;

                return (
                    <div key={index} className="glass-panel-heavy rounded-[3rem] p-8 flex flex-col hover:shadow-2xl transition-all duration-500 group relative overflow-hidden min-h-[650px] bg-white border border-slate-200">
                    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: meta.color }}></div>
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-10 rounded-full" style={{ backgroundColor: meta.color }}></div>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">{meta.name}</h3>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] pl-5 font-bold">{meta.fullName}</p>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 border-slate-100 bg-white shadow-sm relative group-hover:scale-110 transition-transform">
                             <span className="text-lg font-black text-slate-700">{deptRate}<span className="text-[8px]">%</span></span>
                             <span className="text-[6px] font-bold uppercase tracking-widest text-slate-400">Score</span>
                             <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 rotate-45" style={{opacity: deptRate > 0 ? 1 : 0}}></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10 flex-grow">
                        <GridStat label="Total Strength" value={settings[deptCode]} icon={<FaUsers/>} color={meta.color} />
                        <GridStat label="Recognized" value={deptStats.recognized} icon={<FaUserCheck/>} color="#10b981" />
                        <GridStat label="Violations" value={deptStats.violations} icon={<FaUserTimes/>} color="#f43f5e" />
                        <GridStat label="Complaints" value={deptStats.complaints} icon={<MdAssignmentLate/>} color="#fbbf24" />
                    </div>

                    <div className="h-[1px] bg-slate-100 w-full mb-8"></div>
                    
                    <div className="flex justify-between items-center mb-6 px-1">
                        <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-slate-400">Violation Breakdown</span>
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                            <MdReportProblem size={12} /> <span className="text-[9px] font-bold uppercase tracking-wider">Live</span>
                        </div>
                    </div>

                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptStats.breakdown && deptStats.breakdown.length > 0 ? deptStats.breakdown : [{attribute:'None', count:0}]} margin={{top: 20, right: 10, left: -20, bottom: 0}}>
                                <defs>
                                    <linearGradient id={`grad${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={meta.color} stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor={meta.color} stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="attribute" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={45} fill={`url(#grad${index})`} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;