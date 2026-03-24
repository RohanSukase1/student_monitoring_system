
// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
// import { 
//   FaUsers, FaUserCheck, FaUserTimes, FaUserSecret, FaChartBar, FaSearch, 
//   FaSquare, FaCheckSquare, FaIdCard, FaTshirt, FaTimes, 
//   FaFilter, FaWhatsapp, FaClipboardList, FaCopy, FaCamera, FaExclamationTriangle,
//   FaCalendarAlt, FaClock, FaArrowRight, FaCheck, FaPlay, FaStepForward, FaRobot, FaSpinner,
//   FaDownload, FaPhone, FaArrowRight as FaArrowRightSolid
// } from 'react-icons/fa';
// import { 
//   MdSettingsRemote, MdTrendingUp, MdOutlineShield, MdImage, 
//   MdCheckCircle, MdLogout, MdSort, MdWifi, MdWifiOff 
// } from 'react-icons/md';
// import { useNavigate } from 'react-router-dom';

// // --- HELPER FUNCTIONS ---

// const formatTime12Hour = (time24) => {
//     if (!time24) return '--:--:--';
//     const parts = time24.split(':');
//     let h = parseInt(parts[0], 10);
//     const m = parts[1];
//     const s = parts[2] || '00';
    
//     const suffix = h >= 12 ? 'PM' : 'AM';
//     h = h % 12 || 12; 
//     return `${h}:${m}:${s} ${suffix}`;
// };

// const formatDateFriendly = (dateStr) => {
//     if (!dateStr) return 'Unknown Date';
//     const today = new Date();
//     const date = new Date(dateStr);
    
//     if (today.toDateString() === date.toDateString()) return 'Today';
    
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
//     if (yesterday.toDateString() === date.toDateString()) return 'Yesterday';
    
//     return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
// };

// const mapYear = (y) => {
//     if (!y || y === "Unknown") return 'Unknown';
//     const yearNum = Number(y); 
//     if (yearNum === 1) return 'First';
//     if (yearNum === 2) return 'Second';
//     if (yearNum === 3 || yearNum === 6) return 'Third';
//     return 'Unknown';
// };

// const blobToBase64 = (blob) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => resolve(reader.result);
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// };

// const cleanPhoneNumber = (phone) => {
//     if (!phone) return '';
//     // Remove non-numeric characters
//     const cleaned = phone.toString().replace(/\D/g, ''); 
//     // Basic validation for India (adjust if needed)
//     if (cleaned.length === 10) return `91${cleaned}`; 
//     if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned;
//     return cleaned;
// };

// // --- ROBUST CLIPBOARD HELPER ---
// // This forces any image source to become a valid PNG Blob for the clipboard
// const copyImageToClipboard = (imageSource) => {
//     return new Promise((resolve, reject) => {
//         if (!imageSource) {
//             reject("No source");
//             return;
//         }

//         const img = new Image();
//         img.crossOrigin = "anonymous"; // Vital for CORS
//         img.src = imageSource;

//         img.onload = () => {
//             try {
//                 // 1. Draw to canvas to ensure clean data
//                 const canvas = document.createElement('canvas');
//                 canvas.width = img.width;
//                 canvas.height = img.height;
//                 const ctx = canvas.getContext('2d');
//                 ctx.drawImage(img, 0, 0);

//                 // 2. Export as PNG Blob (Clipboard API likes PNGs best)
//                 canvas.toBlob(async (blob) => {
//                     if (!blob) {
//                         reject("Canvas empty");
//                         return;
//                     }
//                     try {
//                         // 3. Write to clipboard
//                         const item = new ClipboardItem({ "image/png": blob });
//                         await navigator.clipboard.write([item]);
//                         resolve(true);
//                     } catch (err) {
//                         console.error("Write failed:", err);
//                         reject(err);
//                     }
//                 }, 'image/png', 1.0);
//             } catch (err) {
//                 reject(err);
//             }
//         };

//         img.onerror = (e) => reject(e);
//     });
// };

// // --- COMPONENTS ---

// const ProCard = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden ${className}`}>
//     {children}
//   </div>
// );

// const SummaryRow = ({ label, value, color, icon, small = false }) => (
//   <div className={`flex justify-between items-center ${small ? 'py-2' : 'py-3'} border-b border-slate-100 last:border-0`}>
//     <div className="flex items-center gap-3">
//       <div className={`flex items-center justify-center rounded-lg ${small ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}`} 
//             style={{ backgroundColor: `${color}15`, color: color }}>
//         {icon}
//       </div>
//       <span className={`font-semibold text-slate-500 uppercase tracking-wide ${small ? 'text-[10px]' : 'text-[11px]'}`}>
//         {label}
//       </span>
//     </div>
//     <span className={`font-bold tracking-tight text-slate-800 ${small ? 'text-sm' : 'text-lg'}`}>
//       {value}
//     </span>
//   </div>
// );

// // --- MODALS ---

// const ImageModal = ({ src, onClose, title, isOffline }) => {
//     if (!src) return null;
//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
//             <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
//                 <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
//                     <h3 className="text-slate-800 font-bold flex items-center gap-2">
//                         <MdImage className="text-indigo-600"/> Evidence Snapshot 
//                         {isOffline && <span className="text-[10px] text-rose-600 bg-rose-100 px-2 py-0.5 rounded border border-rose-200 uppercase ml-2">Offline Cache</span>}
//                     </h3>
//                     <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors bg-white p-2 rounded-full border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 shadow-sm">
//                         <FaTimes size={14} />
//                     </button>
//                 </div>
//                 <div className="flex-grow bg-slate-100 flex items-center justify-center p-4 overflow-hidden relative">
//                     <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
//                     <img src={src} alt="Evidence" className="max-h-[70vh] w-auto object-contain rounded-lg border border-slate-200 shadow-md relative z-10" />
//                 </div>
//                 <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
//                     <span className="text-sm font-medium text-slate-600">{title || "Unknown Student"}</span>
//                     <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase rounded border border-indigo-100">CCTV Verified</span>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- NEW FRONTEND-ONLY WHATSAPP SENDER MODAL ---
// const SenderModal = ({ queue, onClose, onComplete }) => {
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [manualPhone, setManualPhone] = useState("");
//     const [isInputtingPhone, setIsInputtingPhone] = useState(false);
//     const [copyStatus, setCopyStatus] = useState("idle"); // idle, copying, success, error

//     const student = queue[currentIndex];

//     // Reset state when student changes
//     useEffect(() => {
//         if (student) {
//             const clean = cleanPhoneNumber(student.phone);
//             if (clean && clean.length >= 10) {
//                 setManualPhone(clean);
//                 setIsInputtingPhone(false);
//             } else {
//                 setManualPhone("");
//                 setIsInputtingPhone(true);
//             }
//             setCopyStatus("idle");
//         }
//     }, [currentIndex, student]);

//     const handleNext = () => {
//         if (currentIndex < queue.length - 1) {
//             setCurrentIndex(prev => prev + 1);
//         } else {
//             onComplete();
//         }
//     };

//     const handleSkip = () => {
//         handleNext();
//     };

//     const handleSendAndNext = async () => {
//         // 1. Validate Phone
//         const finalPhone = cleanPhoneNumber(manualPhone);
//         if (!finalPhone || finalPhone.length < 10) {
//             alert("Please enter a valid mobile number including country code (e.g. 919876543210)");
//             setIsInputtingPhone(true);
//             return;
//         }

//         // 2. Prepare Message
//         let violation = "General Violation";
//         if (!student.hasId) violation = "No ID Card";
//         else if (!student.isTucked) violation = "Shirt Untucked";
//         else if (!student.disciplined) violation = "Discipline Violation";

//         const message = `*Discipline Alert*\n\nStudent: ${student.name}\nEnrollment: ${student.enrollment}\nViolation: ${violation}\nTime: ${formatTime12Hour(student.entryTime)}\n\nEvidence is attached below. Please maintain discipline.`;
//         const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;

//         // 3. Handle Evidence (Force Copy to Clipboard)
//         if (student.evidenceBase64 || student.evidence) {
//             setCopyStatus("copying");
            
//             try {
//                 // Use the robust helper to force PNG conversion
//                 await copyImageToClipboard(student.evidenceBase64 || student.evidence);
//                 setCopyStatus("success");
//             } catch (err) {
//                 console.error("Clipboard failed even with conversion:", err);
//                 setCopyStatus("error");
//                 alert("Clipboard copy failed. Please right-click the image and select 'Copy Image' manually.");
//                 // We do NOT auto-download here anymore per request.
//                 // We just proceed to open WhatsApp so user can manually paste if they managed to copy.
//             }
//         }

//         // 4. Open WhatsApp
//         window.open(url, '_blank');

//         // 5. Advance
//         handleNext();
//     };

//     if (!student) return null;

//     const progress = Math.round(((currentIndex) / queue.length) * 100);

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//              <div className="relative max-w-lg w-full flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
                
//                 {/* Header */}
//                 <div className="p-4 bg-slate-50 border-b border-slate-100">
//                     <div className="flex justify-between items-center mb-2">
//                         <h3 className="text-slate-800 font-bold flex items-center gap-2">
//                             <FaWhatsapp className="text-emerald-500 text-xl"/> 
//                             WhatsApp Dispatcher
//                         </h3>
//                         <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FaTimes/></button>
//                     </div>
//                     <div className="w-full bg-slate-200 rounded-full h-1.5">
//                         <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
//                     </div>
//                     <p className="text-[10px] text-slate-500 mt-1 text-right font-mono">{currentIndex + 1} / {queue.length}</p>
//                 </div>
                
//                 {/* Body */}
//                 <div className="p-6 flex flex-col gap-6">
                    
//                     {/* Student Info Card */}
//                     <div className="flex gap-4 items-start">
//                         <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative group">
//                             <img src={student.evidenceBase64 || student.evidence} className="w-full h-full object-cover" alt="Preview"/>
//                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
//                                 <FaCamera/>
//                             </div>
//                         </div>
//                         <div className="flex-grow">
//                             <h4 className="font-bold text-slate-800 text-xl leading-tight">{student.name}</h4>
//                             <div className="text-xs font-mono text-slate-500 mb-2">{student.enrollment}</div>
                            
//                             {/* Violation Tag */}
//                             <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-bold uppercase tracking-wider">
//                                 <FaExclamationTriangle size={10}/> 
//                                 {!student.hasId ? "No ID Card" : !student.isTucked ? "Untucked" : "Discipline"}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Phone Number Input Logic */}
//                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
//                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
//                             Destination Number (WhatsApp)
//                         </label>
//                         <div className="flex gap-2">
//                             <div className="relative flex-grow">
//                                 <FaPhone className="absolute left-3 top-3 text-slate-400" size={12}/>
//                                 <input 
//                                     type="text" 
//                                     value={manualPhone}
//                                     onChange={(e) => setManualPhone(e.target.value)}
//                                     placeholder="Enter 10-digit mobile"
//                                     className={`w-full pl-9 pr-3 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 
//                                     ${isInputtingPhone ? 'border-rose-300 ring-rose-100' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'}`}
//                                 />
//                             </div>
//                         </div>
//                         {isInputtingPhone && <p className="text-[10px] text-rose-500 mt-1 font-medium">* Phone number missing or invalid. Please enter manually.</p>}
//                     </div>

//                     <div className={`text-xs p-3 rounded-lg border flex gap-2 transition-colors duration-300
//                         ${copyStatus === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
//                           copyStatus === 'copying' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 
//                           'bg-blue-50 border-blue-100 text-slate-500'}`}>
//                         <div className="shrink-0 mt-0.5">
//                             {copyStatus === 'success' ? <FaCheck /> : copyStatus === 'copying' ? <FaSpinner className="animate-spin"/> : <FaClipboardList />}
//                         </div>
//                         <p>
//                            {copyStatus === 'success' 
//                              ? <strong>Evidence Copied! Ready to Paste (Ctrl+V) in WhatsApp.</strong>
//                              : copyStatus === 'copying' 
//                                ? "Converting and copying image..." 
//                                : "Clicking 'Send' will copy the evidence image and open WhatsApp. You just need to Paste (Ctrl+V)."}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
//                       <button onClick={handleSkip} className="text-slate-400 text-xs font-bold uppercase tracking-wider hover:text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">
//                         Skip
//                       </button>
                      
//                       <button 
//                          onClick={handleSendAndNext}
//                          disabled={copyStatus === 'copying'}
//                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all active:scale-95 hover:-translate-y-0.5"
//                       >
//                          {copyStatus === 'copying' ? "Processing..." : <><FaWhatsapp size={16}/> Send & Next <FaArrowRightSolid size={10}/></>}
//                       </button>
//                 </div>
//              </div>
//         </div>
//     );
// };

// const BulkMessageModal = ({ message, onClose }) => {
//     const [copied, setCopied] = useState(false);

//     const handleCopy = () => {
//         navigator.clipboard.writeText(message);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
//             <div className="relative max-w-2xl w-full flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
//                 <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
//                     <h3 className="text-slate-800 font-bold flex items-center gap-2"><FaClipboardList className="text-indigo-600"/> Generated Report</h3>
//                     <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
//                         <FaTimes size={16} />
//                     </button>
//                 </div>
//                 <div className="p-6 bg-slate-50">
//                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
//                         <textarea 
//                             readOnly 
//                             value={message} 
//                             className="w-full h-64 bg-transparent text-sm font-mono text-slate-700 focus:outline-none resize-none custom-scrollbar"
//                         />
//                         <button 
//                             onClick={handleCopy}
//                             className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
//                         >
//                             {copied ? <MdCheckCircle /> : <FaCopy />} {copied ? "Copied" : "Copy"}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- MAIN COMPONENT ---

// const DepartmentDashboard = () => {
//   const [activeTab, setActiveTab] = useState('actions');
//   const navigate = useNavigate();

//   const [currentDept] = useState({ 
//     name: localStorage.getItem('dept_name') || 'Computer Engineering', 
//     code: 'AN' 
//   });

//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isOffline, setIsOffline] = useState(false);
//   const studentsRef = useRef([]); 
    
//   // --- FILTER STATES ---
//   const [selectedYear, setSelectedYear] = useState('Third');
//   const [filterType, setFilterType] = useState('all'); 
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortConfig, setSortConfig] = useState({ key: 'entryTime', direction: 'desc' });
  
//   // Date and Time Filter States
//   const [filterDate, setFilterDate] = useState(''); // YYYY-MM-DD
//   const [filterStartTime, setFilterStartTime] = useState(''); // HH:MM
//   const [filterEndTime, setFilterEndTime] = useState(''); // HH:MM

//   const [selectedStudents, setSelectedStudents] = useState([]);
//   const [viewEvidence, setViewEvidence] = useState(null);
//   const [bulkMessage, setBulkMessage] = useState(null);
//   const [senderQueue, setSenderQueue] = useState(null); // For Sender Modal

//   const [realtimeCounts, setRealtimeCounts] = useState({
//     hasData: false,
//     raw: null
//   });

//   useEffect(() => {
//     studentsRef.current = students;
//   }, [students]);

//   // --- 1. Fetch Data ---
//   useEffect(() => {
//     let isMounted = true;

//     const cachedData = localStorage.getItem('dashboard_cache');
//     if (cachedData) {
//         const parsed = JSON.parse(cachedData);
//         setStudents(parsed);
//         studentsRef.current = parsed;
//         setLoading(false);
//     }

//     const fetchData = async () => {
//       try {
//         const res = await fetch("http://localhost:5000/entries");
//         if (!res.ok) throw new Error("Flask API error");
//         const json = await res.json();
        
//         const currentData = studentsRef.current;
        
//         const normalized = await Promise.all(json.map(async (item, idx) => {
//             const tempId = item.id ?? idx + 1;
//             const existing = currentData.find(s => s.id === tempId);
            
//             let evidenceUrl = item.image_path ? `http://localhost:5000/evidence?path=${encodeURIComponent(item.image_path)}` : null;
//             let evidenceBase64 = existing?.evidenceBase64 || null;

//             if (evidenceUrl && !evidenceBase64) {
//                 try {
//                     const imgRes = await fetch(evidenceUrl);
//                     if (imgRes.ok) {
//                         const blob = await imgRes.blob();
//                         evidenceBase64 = await blobToBase64(blob);
//                     }
//                 } catch (imgErr) { }
//             }

//             return {
//                 id: tempId,
//                 enrollment: String(item.enrollment ?? "UNKNOWN"),
//                 name: item.name ?? "Unknown",
//                 phone: item.phone || item.mobile || item.contact || "", 
//                 year: mapYear(item.year),
//                 entryTime: item.time || "00:00:00", 
//                 department: item.department || "General", 
//                 hasId: item.id_card === 1, 
//                 isTucked: item.shirt_tucked === 1, 
//                 disciplined: item.discipline === 1, 
//                 evidence: evidenceUrl,
//                 evidenceBase64: evidenceBase64,
//                 filePath: item.image_path,
//                 originalDate: item.date 
//             };
//         }));

//         const deptFiltered = normalized.filter(s => 
//             currentDept.name === 'General Department' || 
//             (s.department && s.department.toLowerCase().includes('an') || true) 
//         );

//         if (isMounted) {
//           setStudents(deptFiltered);
//           setLoading(false);
//           setIsOffline(false);
          
//           try {
//             localStorage.setItem('dashboard_cache', JSON.stringify(deptFiltered));
//           } catch (storageErr) {
//             const lightData = deptFiltered.map(s => ({...s, evidenceBase64: null}));
//             localStorage.setItem('dashboard_cache', JSON.stringify(lightData));
//           }
//         }
//       } catch (err) {
//         console.error("Backend offline");
//         if (isMounted) setIsOffline(true);
//       }
//     };

//     fetchData(); 
//     const interval = setInterval(fetchData, 3000);
//     return () => { isMounted = false; clearInterval(interval); };
//   }, [currentDept.name]);

//   // --- 2. Fetch Live Counts ---
//   useEffect(() => {
//     let isMounted = true;
//     const fetchCounts = async () => {
//         try {
//             const res = await fetch("http://localhost:5000/counts");
//             if (res.ok) {
//                 const data = await res.json();
//                 if (isMounted) {
//                     setRealtimeCounts({
//                         hasData: true,
//                         raw: data
//                     });
//                 }
//             }
//         } catch (err) { }
//     };
//     fetchCounts();
//     const interval = setInterval(fetchCounts, 1000); 
//     return () => { isMounted = false; clearInterval(interval); };
//   }, []);

//   // --- MEMOS ---

//   const stats = useMemo(() => {
//     const dc = currentDept.code.toLowerCase(); 
    
//     if (realtimeCounts.hasData && realtimeCounts.raw) {
//         const raw = realtimeCounts.raw;
//         const disciplined = raw[`disciplined_${dc}`] || 0;
//         const undisciplined = raw[`undisciplined_${dc}`] || 0;
//         const total = disciplined + undisciplined;
//         const rate = raw[`discipline_rate_${dc}`] || 0;

//         return { total, disciplined, undisciplined, rate };
//     }
    
//     const total = students.length;
//     const disciplined = students.filter(s=>s.disciplined).length;
//     const undisciplined = total - disciplined;
//     const rate = total === 0 ? 0 : Math.round((disciplined / total) * 100);
    
//     return { total, disciplined, undisciplined, rate };
//   }, [realtimeCounts, students, currentDept.code]);

//   // GRAPH: 8 AM to 5 PM
//   const graphData = useMemo(() => {
//     const buckets = {};
//     const startHour = 8;
//     const endHour = 17; 
    
//     let currentH = startHour;
//     let currentM = 0;

//     while (currentH < endHour || (currentH === endHour && currentM === 0)) {
//         const hStr = currentH.toString().padStart(2, '0');
//         const mStr = currentM.toString().padStart(2, '0');
//         buckets[`${hStr}:${mStr}`] = 0;

//         currentM += 30; 
//         if (currentM === 60) {
//             currentH++;
//             currentM = 0;
//         }
//     }

//     students.forEach(s => {
//         if (!s.entryTime) return;
//         const [hStr, mStr] = s.entryTime.split(':');
//         const h = parseInt(hStr, 10);
//         const m = parseInt(mStr, 10);
//         const totalMins = h * 60 + m;

//         const roundedMins = Math.floor(totalMins / 30) * 30;
//         const bucketH = Math.floor(roundedMins / 60);
//         const bucketM = roundedMins % 60;
        
//         const key = `${bucketH.toString().padStart(2, '0')}:${bucketM.toString().padStart(2, '0')}`;

//         if (buckets[key] !== undefined) {
//             buckets[key]++;
//         }
//     });

//     return Object.entries(buckets).map(([time, count]) => ({ time, count }));
//   }, [students]);

//   const summaryData = useMemo(() => {
//     const base = { strength: 0, scanned: 0, recognized: 0, disciplined: 0, undisciplined: 0, noId: 0, untucked: 0, rate: 0 };
    
//     if (realtimeCounts.hasData && realtimeCounts.raw) {
//         const raw = realtimeCounts.raw;
//         const dc = currentDept.code.toLowerCase(); 
        
//         const mapApiYear = (suffix) => {
//             const disc = raw[`disciplined_${dc}_${suffix}`] || 0;
//             const undisc = raw[`undisciplined_${dc}_${suffix}`] || 0;
//             return {
//                 strength: disc + undisc,
//                 scanned: disc + undisc,
//                 recognized: raw[`recognized_${dc}_${suffix}`] || 0,
//                 disciplined: disc,
//                 undisciplined: undisc,
//                 noId: raw[`id_card_no_${dc}_${suffix}`] || 0,
//                 untucked: raw[`untucked_${dc}_${suffix}`] || 0,
//                 rate: raw[`discipline_rate_${dc}_${suffix}`] || 0
//             };
//         };

//         return {
//             First: mapApiYear('fy'),
//             Second: mapApiYear('sy'),
//             Third: mapApiYear('ty'),
//             Unknown: { ...base }
//         };
//     }

//     const data = { First: {...base}, Second: {...base}, Third: {...base}, Unknown: {...base} };
    
//     students.forEach(s => {
//         const yKey = (s.year === 'Unknown' || !data[s.year]) ? 'Unknown' : s.year;
//         const y = data[yKey];
//         if (!y) return;
        
//         y.strength++;
//         y.scanned++;
//         if (s.name !== 'Unknown') y.recognized++;
        
//         if (s.disciplined) y.disciplined++;
//         else {
//             y.undisciplined++;
//             if (!s.hasId) y.noId++;
//             if (!s.isTucked) y.untucked++;
//         }
//     });

//     Object.keys(data).forEach(k => {
//         const y = data[k];
//         y.rate = y.strength === 0 ? 0 : Math.round((y.disciplined / y.strength) * 100);
//     });
//     return data;
//   }, [students, realtimeCounts, currentDept.code]);

//   // --- FILTERING ---
//   const filteredStudents = useMemo(() => {
//     let data;

//     if (selectedYear === 'Unknown') {
//         data = students.filter(s => s.year === 'Unknown' || s.name === 'Unknown');
//     } else {
//         data = students.filter(s => s.year === selectedYear);
//     }

//     if (searchQuery) {
//         const q = searchQuery.toLowerCase();
//         data = data.filter(s => 
//             s.name.toLowerCase().includes(q) || 
//             s.enrollment.toLowerCase().includes(q)
//         );
//     }

//     // Date/Time Filtering
//     if (filterDate) {
//         data = data.filter(s => s.originalDate === filterDate);
//     }
//     if (filterStartTime) {
//         data = data.filter(s => s.entryTime >= filterStartTime);
//     }
//     if (filterEndTime) {
//         data = data.filter(s => s.entryTime <= filterEndTime);
//     }

//     if (filterType === 'disciplined') data = data.filter(s => s.disciplined);
//     if (filterType === 'undisciplined') data = data.filter(s => !s.disciplined);
//     if (filterType === 'noId') data = data.filter(s => !s.hasId);
//     if (filterType === 'untucked') data = data.filter(s => !s.isTucked);

//     data.sort((a, b) => {
//         if (sortConfig.key === 'entryTime') {
//             const dA = a.originalDate || '';
//             const dB = b.originalDate || '';
//             const tA = a.entryTime || '';
//             const tB = b.entryTime || '';
            
//             if (dA !== dB) {
//                 return sortConfig.direction === 'asc' ? dA.localeCompare(dB) : dB.localeCompare(dA);
//             }
//             return sortConfig.direction === 'asc' ? tA.localeCompare(tB) : tB.localeCompare(tA);
//         }

//         let valA = a[sortConfig.key];
//         let valB = b[sortConfig.key];
//         if (typeof valA === 'string') valA = valA.toLowerCase();
//         if (typeof valB === 'string') valB = valB.toLowerCase();

//         if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//     });

//     return data;
//   }, [students, selectedYear, filterType, searchQuery, sortConfig, filterDate, filterStartTime, filterEndTime]);

//   const handleSort = (key) => {
//     setSortConfig(prev => ({
//         key,
//         direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
//     }));
//   };

//   const toggleSelect = (id) => {
//     if (selectedStudents.includes(id)) setSelectedStudents(prev => prev.filter(sid => sid !== id));
//     else setSelectedStudents(prev => [...prev, id]);
//   };

//   const toggleSelectAll = () => {
//     if (selectedStudents.length === filteredStudents.length && filteredStudents.length > 0) setSelectedStudents([]);
//     else setSelectedStudents(filteredStudents.map(s => s.id));
//   };

//   const handleGenerateBulkMessage = () => {
//     if (selectedStudents.length === 0) return;
//     const selectedList = students.filter(s => selectedStudents.includes(s.id));
//     const noIdList = selectedList.filter(s => !s.hasId);
//     const untuckedList = selectedList.filter(s => !s.isTucked);
//     const allList = selectedList.filter(s => !s.disciplined); 

//     let msg = "Following students have been noticed as Undisciplined Today,\n\n";

//     if (noIdList.length > 0) {
//         msg += "violation type : no id\n";
//         noIdList.forEach(s => msg += `"${s.name}" "${s.enrollment}"\n`);
//         msg += "\n";
//     }
//     if (untuckedList.length > 0) {
//         msg += "violation type : shirt untucked\n";
//         untuckedList.forEach(s => msg += `"${s.name}" "${s.enrollment}"\n`);
//         msg += "\n";
//     }
//     if (allList.length > 0 && noIdList.length === 0 && untuckedList.length === 0) {
//         msg += "violation type: general discipline\n";
//         allList.forEach(s => msg += `"${s.name}" "${s.enrollment}"\n`);
//         msg += "\n";
//     }
//     msg += "strictly maintain discipline from tomorrow.";
//     setBulkMessage(msg);
//   };

//   const handleOpenSender = () => {
//     const selectedList = students.filter(s => selectedStudents.includes(s.id));
//     if (selectedList.length === 0) {
//         alert("No students selected.");
//         return;
//     }
//     setSenderQueue(selectedList);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/');
//   };

//   if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-sans animate-pulse">Initializing Dashboard...</div>;

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-['Poppins'] tracking-tight selection:bg-indigo-100 selection:text-indigo-900">
//       <style dangerouslySetInnerHTML={{ __html: `
//         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
//         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }
//         .sticky-header { position: sticky; top: 0; z-index: 20; backdrop-filter: blur(8px); background: rgba(255,255,255,0.95); }
//         input[type="date"], input[type="time"] { color-scheme: light; cursor: pointer; }
//       `}} />

//       {/* --- MODALS --- */}
//       {viewEvidence && (
//           <ImageModal 
//             src={viewEvidence.evidenceBase64 || viewEvidence.url} 
//             title={viewEvidence.title} 
//             isOffline={isOffline || !viewEvidence.url}
//             onClose={() => setViewEvidence(null)} 
//           />
//       )}
//       {bulkMessage && <BulkMessageModal message={bulkMessage} onClose={() => setBulkMessage(null)} />}
      
//       {/* NEW SENDER MODAL */}
//       {senderQueue && (
//           <SenderModal 
//             queue={senderQueue} 
//             onClose={() => setSenderQueue(null)}
//             onComplete={() => {
//                 setSenderQueue(null);
//                 alert("All selected alerts processed.");
//                 setSelectedStudents([]);
//             }}
//           />
//       )}

//       {/* --- HEADER --- */}
//       <header className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
//         <div>
//            <div className="flex items-center gap-3 mb-2">
//                 <span className="px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-[11px] font-bold tracking-widest text-indigo-700 uppercase flex items-center gap-2">
//                   <MdSettingsRemote /> Department Dashboard
//                 </span>
//                 {isOffline ? (
//                    <span className="px-3 py-1 rounded-full border border-rose-200 bg-rose-50 text-[11px] font-bold tracking-widest text-rose-600 uppercase flex items-center gap-2">
//                       <MdWifiOff /> Offline Mode
//                    </span>
//                 ) : (
//                   <span className="px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-bold tracking-widest text-emerald-600 uppercase flex items-center gap-2">
//                       <MdWifi /> System Online
//                    </span>
//                 )}
//            </div>
//            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 uppercase leading-none">
//               {currentDept.name}
//            </h1>
//         </div>

//         <nav className="flex p-1.5 bg-white border border-slate-200 shadow-sm rounded-xl gap-1 items-center">
//           {[
//               { id: 'stats', label: 'Overview' },
//               { id: 'summary', label: 'Yearly Summary' },
//               { id: 'actions', label: 'Live Actions' }
//           ].map((tab) => (
//             <button key={tab.id} onClick={() => setActiveTab(tab.id)}
//               className={`px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 relative overflow-hidden
//               ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
//               {tab.label}
//             </button>
//           ))}
//           <button onClick={handleLogout} className="ml-2 px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-100 hover:border-rose-600 transition-all duration-200 flex items-center gap-2">
//             <MdLogout size={14} /> 
//           </button>
//         </nav>
//       </header>

//       <main className="max-w-[1600px] mx-auto min-h-[700px]">
        
//         {/* --- TAB 1: STATISTICS --- */}
//         {activeTab === 'stats' && (
//           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
//               <ProCard className="p-8 h-[350px] md:h-[400px]">
//                   <div className="absolute top-6 left-8 z-10">
//                       <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2"><FaChartBar className="text-indigo-600"/> Entry Analytics</h3>
//                   </div>
//                   <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={graphData} margin={{ top: 60, right: 10, left: -20, bottom: 0 }}>
//                       <defs>
//                           <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
//                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
//                           </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
//                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
//                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
//                       <Tooltip 
//                         contentStyle={{backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
//                         itemStyle={{color: '#1e293b', fontWeight: 'bold'}} 
//                         labelStyle={{color: '#64748b', fontSize: '11px'}}
//                       />
//                       <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
//                       </AreaChart>
//                   </ResponsiveContainer>
//               </ProCard>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                   {[
//                       { label: 'Total Visits', val: stats.total, color: '#3b82f6', icon: <FaUsers/>, bg: 'bg-blue-50' },
//                       { label: 'Disciplined', val: stats.disciplined, color: '#10b981', icon: <FaUserCheck/>, bg: 'bg-emerald-50' },
//                       { label: 'Violations', val: stats.undisciplined, color: '#f43f5e', icon: <FaUserTimes/>, bg: 'bg-rose-50' },
//                       { label: 'Compliance', val: `${stats.rate}%`, color: '#f59e0b', icon: <MdTrendingUp/>, bg: 'bg-amber-50' },
//                   ].map((stat, idx) => (
//                       <ProCard key={idx} className="p-6 hover:-translate-y-1 transition-transform duration-300">
//                           <div className="flex justify-between items-start mb-4">
//                               <div className={`p-3 rounded-xl text-xl shadow-sm ${stat.bg}`} style={{color: stat.color}}>{stat.icon}</div>
//                               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
//                           </div>
//                           <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">{stat.val}</h2>
//                       </ProCard>
//                   ))}
//               </div>
//           </div>
//         )}

//         {/* --- TAB 2: YEARLY SUMMARY --- */}
//         {activeTab === 'summary' && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300 h-full">
//              {['First', 'Second', 'Third'].map((year, idx) => {
//                  const data = summaryData[year];
//                  const colors = ['#3b82f6', '#8b5cf6', '#f43f5e']; 
//                  const bgColors = ['bg-blue-50', 'bg-violet-50', 'bg-rose-50'];
//                  const accent = colors[idx];
//                  return (
//                     <div key={year} className="bg-white rounded-[1.5rem] p-8 flex flex-col relative overflow-hidden group border-t-4 shadow-sm border-x border-b border-slate-200" style={{ borderTopColor: accent }}>
//                         <div className="flex justify-between items-end mb-8 relative z-10">
//                             <div>
//                                 <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase leading-none">{year}</h3>
//                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Year Report</p>
//                             </div>
//                             <div className={`text-center p-2.5 rounded-xl border border-slate-200 ${bgColors[idx]}`}>
//                                 <span className="text-2xl font-black tracking-tighter block leading-none" style={{color: accent}}>{data.rate}%</span>
//                                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Score</span>
//                             </div>
//                         </div>

//                         <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
//                             <SummaryRow label="Total Scanned" value={data.scanned} color="#3b82f6" icon={<MdOutlineShield/>} />
//                             <SummaryRow label="Recognized" value={data.recognized} color="#10b981" icon={<FaUserCheck/>} />
//                         </div>

//                         <div className="grid grid-cols-2 gap-4 mb-6">
//                             <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
//                                 <div className="text-2xl font-black text-emerald-700">{data.disciplined}</div>
//                                 <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Pass</div>
//                             </div>
//                             <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
//                                 <div className="text-2xl font-black text-rose-700">{data.undisciplined}</div>
//                                 <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Fail</div>
//                             </div>
//                         </div>

//                         <div className="flex-grow flex flex-col justify-end">
//                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Top Violations</p>
//                             <SummaryRow small label="No ID Card" value={data.noId} color="#ef4444" icon={<FaIdCard/>} />
//                             <SummaryRow small label="Shirt Untucked" value={data.untucked} color="#eab308" icon={<FaTshirt/>} />
//                         </div>
//                     </div>
//                  )
//              })}
//           </div>
//         )}

//         {/* --- TAB 3: LIVE ACTIONS --- */}
//         {activeTab === 'actions' && (
//           <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-500 min-h-[750px]">
            
//             <div className="bg-white border border-slate-200 p-4 rounded-2xl mb-6 flex flex-col xl:flex-row gap-4 justify-between items-center relative z-20 shadow-sm">
                
//                 {/* FILTER GROUP 1: SEARCH & YEAR */}
//                 <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
//                     <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
//                         {['First', 'Second', 'Third', 'Unknown'].map(y => (
//                             <button key={y} onClick={() => setSelectedYear(y)}
//                                 className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
//                                 ${selectedYear === y ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
//                                 {y}
//                             </button>
//                         ))}
//                     </div>
//                     <div className="relative group flex-grow xl:flex-grow-0">
//                         <FaSearch className="absolute left-3 top-3 text-slate-400" size={12}/>
//                         <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
//                             placeholder="Search Name or ID..." 
//                             className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full xl:w-48 transition-all placeholder:text-slate-400" 
//                         />
//                     </div>
//                 </div>

//                 {/* FILTER GROUP 2: DATE & TIME */}
//                 <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
//                     <div className="relative flex items-center">
//                         <FaCalendarAlt className="absolute left-3 text-slate-400" size={10}/>
//                         <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
//                             className="pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 focus:outline-none focus:border-indigo-500 w-32" 
//                         />
//                     </div>
//                     <div className="h-4 w-px bg-slate-300 mx-1"></div>
//                     <div className="flex items-center gap-1">
//                         <FaClock className="text-slate-400" size={10}/>
//                         <input type="time" value={filterStartTime} onChange={(e) => setFilterStartTime(e.target.value)}
//                             className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 focus:outline-none focus:border-indigo-500" 
//                         />
//                         <span className="text-slate-400 text-[10px]"><FaArrowRight size={8}/></span>
//                         <input type="time" value={filterEndTime} onChange={(e) => setFilterEndTime(e.target.value)}
//                             className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 focus:outline-none focus:border-indigo-500" 
//                         />
//                     </div>
//                     {(filterDate || filterStartTime || filterEndTime) && (
//                         <button onClick={() => { setFilterDate(''); setFilterStartTime(''); setFilterEndTime(''); }} className="ml-1 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
//                             <FaTimes size={10}/>
//                         </button>
//                     )}
//                 </div>

//                 {/* FILTER GROUP 3: TYPE */}
//                 <div className="flex overflow-x-auto gap-2 w-full xl:w-auto pb-2 xl:pb-0 custom-scrollbar">
//                     {[
//                       { id: 'all', label: 'All', activeClass: 'bg-slate-800 text-white', icon: null },
//                       { id: 'disciplined', label: 'Disciplined', activeClass: 'bg-emerald-600 text-white', icon: <FaCheckSquare size={10}/> },
//                       { id: 'undisciplined', label: 'All Violations', activeClass: 'bg-orange-600 text-white', icon: <FaExclamationTriangle size={10}/> },
//                       { id: 'noId', label: 'No ID', activeClass: 'bg-rose-600 text-white', icon: <FaIdCard size={10}/> },
//                       { id: 'untucked', label: 'Untucked', activeClass: 'bg-yellow-600 text-white', icon: <FaTshirt size={10}/> },
//                     ].map(f => (
//                       <button key={f.id} onClick={() => setFilterType(f.id)}
//                         className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-2
//                         ${filterType === f.id ? `${f.activeClass} shadow-md border-transparent` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
//                         {f.icon} {f.label}
//                       </button>
//                     ))}
//                 </div>
//             </div>

//             <ProCard className="flex-grow flex flex-col h-[600px] relative"> 
//                 <div className="sticky-header grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
//                     <div className="col-span-1 flex items-center gap-2">
//                         <button onClick={toggleSelectAll} className="hover:text-indigo-600 transition-colors">
//                             {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 ? <FaCheckSquare className="text-indigo-600" /> : <FaSquare />}
//                         </button>
//                         <span>Select</span>
//                     </div>
//                     <div className="col-span-4">Student Profile</div>
//                     <div className="col-span-3">Status</div>
//                     <div className="col-span-2">Time</div>
//                     <div className="col-span-2 text-right">Proof</div>
//                 </div>

//                 {/* CRITICAL: pb-32 ADDED HERE TO PREVENT FOOTER OVERLAP */}
//                 <div className="flex-grow overflow-y-auto custom-scrollbar p-0 pb-32">
//                     {filteredStudents.length === 0 ? (
//                         <div className="h-64 flex flex-col items-center justify-center text-slate-400">
//                             <FaUserSecret size={48} className="mb-4 opacity-30 text-slate-300"/>
//                             <p className="text-sm font-medium">No records found matching filters</p>
//                         </div>
//                     ) : (
//                         // Date Partition Rendering Logic
//                         filteredStudents.map((student, idx) => {
//                             const showHeader = idx === 0 || student.originalDate !== filteredStudents[idx - 1].originalDate;
                            
//                             return (
//                                 <React.Fragment key={student.id}>
//                                     {showHeader && (
//                                         <div className="px-6 py-2 bg-slate-100 border-y border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
//                                             <FaCalendarAlt /> {formatDateFriendly(student.originalDate)}
//                                         </div>
//                                     )}
//                                     <div onClick={() => toggleSelect(student.id)} 
//                                         className={`grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-slate-50 transition-all duration-150 cursor-pointer group relative
//                                         ${selectedStudents.includes(student.id) 
//                                             ? 'bg-indigo-50/60' 
//                                             : 'bg-white hover:bg-slate-50'}`}>
                                        
//                                         <div className="col-span-1 flex items-center gap-3 relative z-10">
//                                             <div className={`${selectedStudents.includes(student.id) ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
//                                                 {selectedStudents.includes(student.id) ? <FaCheckSquare /> : <FaSquare />}
//                                             </div>
//                                             <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
//                                         </div>

//                                         <div className="col-span-4 flex items-center gap-4 relative z-10">
//                                             <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold capitalize shadow-sm border
//                                                 ${student.disciplined 
//                                                     ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
//                                                     : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
//                                                 {student.name ? student.name.charAt(0) : '?'}
//                                             </div>
//                                             <div>
//                                                 <h4 className="font-bold text-sm text-slate-800 leading-tight capitalize">{student.name}</h4>
//                                                 <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">{student.enrollment}</span>
//                                             </div>
//                                         </div>

//                                         <div className="col-span-3 flex flex-wrap gap-2 relative z-10">
//                                             {student.disciplined ? (
//                                                 <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
//                                                     <MdCheckCircle /> Disciplined
//                                                 </span>
//                                             ) : (
//                                                 <>
//                                                     {!student.hasId && (
//                                                         <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
//                                                             <FaIdCard /> No ID
//                                                         </span>
//                                                     )}
//                                                     {!student.isTucked && (
//                                                         <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
//                                                             <FaTshirt /> Untucked
//                                                         </span>
//                                                     )}
//                                                 </>
//                                             )}
//                                         </div>

//                                         <div className="col-span-2 font-mono text-xs text-slate-600 font-medium relative z-10">
//                                             {formatTime12Hour(student.entryTime)}
//                                         </div>

//                                         <div className="col-span-2 text-right relative z-10">
//                                             <button 
//                                             onClick={(e) => { 
//                                                 e.stopPropagation(); 
//                                                 setViewEvidence({ 
//                                                     url: student.evidence, 
//                                                     evidenceBase64: student.evidenceBase64,
//                                                     title: student.name 
//                                                 }); 
//                                             }} 
//                                             className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md" 
//                                             title="View Evidence">
//                                             <FaCamera size={12} />
//                                             <span className="text-[10px] font-bold uppercase tracking-wider">Proof</span>
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </React.Fragment>
//                             );
//                         })
//                     )}
//                 </div>

//                 {/* IMPROVED STABLE ACTION FOOTER */}
//                 <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white border border-slate-200 p-4 rounded-2xl shadow-2xl flex justify-between items-center transition-all duration-300 z-40 transform ${selectedStudents.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
//                       <div className="flex items-center gap-3">
//                           <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-lg shadow-indigo-300"></span>
//                           <div>
//                               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Selected Action</p>
//                               <p className="text-lg font-black text-slate-800 leading-none">{selectedStudents.length} Students</p>
//                           </div>
//                       </div>
//                       <div className="flex gap-3">
//                         <button 
//                             onClick={handleOpenSender}
//                             className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-emerald-200 hover:shadow-2xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
//                         >
//                             <FaWhatsapp className="text-lg" /> Send Alerts
//                         </button>
//                         <button 
//                             onClick={handleGenerateBulkMessage}
//                             className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-indigo-200 hover:shadow-2xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
//                         >
//                             <FaClipboardList className="text-lg" /> Report
//                         </button>
//                       </div>
//                 </div>
//             </ProCard>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default DepartmentDashboard;
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  FaUsers, FaUserCheck, FaUserTimes, FaUserSecret, FaChartBar, FaSearch, 
  FaSquare, FaCheckSquare, FaIdCard, FaTshirt, FaTimes, 
  FaFilter, FaWhatsapp, FaClipboardList, FaCopy, FaCamera, FaExclamationTriangle,
  FaCalendarAlt, FaClock, FaArrowRight, FaCheck, FaPlay, FaStepForward, FaRobot, FaSpinner,
  FaDownload, FaPhone, FaArrowRight as FaArrowRightSolid, FaChevronLeft, FaChevronRight, FaUserShield
} from 'react-icons/fa';
import { 
  MdSettingsRemote, MdTrendingUp, MdOutlineShield, MdImage, 
  MdCheckCircle, MdLogout, MdSort, MdWifi, MdWifiOff 
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

// --- HELPER FUNCTIONS ---

const formatTime12Hour = (time24) => {
    if (!time24) return '--:--:--';
    const parts = time24.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const s = parts[2] || '00';
    
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; 
    return `${h}:${m}:${s} ${suffix}`;
};

const formatDateFriendly = (dateStr) => {
    if (!dateStr) return 'Unknown Date';
    const today = new Date();
    const date = new Date(dateStr);
    
    if (today.toDateString() === date.toDateString()) return 'Today';
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const mapYear = (y) => {
    if (!y || y === "Unknown") return 'Unknown';
    const yearNum = Number(y); 
    if (yearNum === 1) return 'First';
    if (yearNum === 2) return 'Second';
    if (yearNum === 3 || yearNum === 6) return 'Third';
    return 'Unknown';
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.toString().replace(/\D/g, ''); 
    if (cleaned.length === 10) return `91${cleaned}`; 
    if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned;
    return cleaned;
};

// --- ROBUST CLIPBOARD HELPER ---
const copyImageToClipboard = (imageSource) => {
    return new Promise((resolve, reject) => {
        if (!imageSource) {
            reject("No source");
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous"; 
        img.src = imageSource;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        reject("Canvas empty");
                        return;
                    }
                    try {
                        const item = new ClipboardItem({ "image/png": blob });
                        await navigator.clipboard.write([item]);
                        resolve(true);
                    } catch (err) {
                        console.error("Write failed:", err);
                        reject(err);
                    }
                }, 'image/png', 1.0);
            } catch (err) {
                reject(err);
            }
        };

        img.onerror = (e) => reject(e);
    });
};

// --- COMPONENTS ---

const ProCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const SummaryRow = ({ label, value, color, icon, small = false }) => (
  <div className={`flex justify-between items-center ${small ? 'py-2' : 'py-3'} border-b border-slate-100 last:border-0`}>
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center rounded-lg ${small ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}`} 
            style={{ backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
      <span className={`font-semibold text-slate-500 uppercase tracking-wide ${small ? 'text-[10px]' : 'text-[11px]'}`}>
        {label}
      </span>
    </div>
    <span className={`font-bold tracking-tight text-slate-800 ${small ? 'text-sm' : 'text-lg'}`}>
      {value}
    </span>
  </div>
);

// --- MODALS ---

const ImageModal = ({ initialIndex, studentsList, onClose, isOffline }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                setCurrentIndex((prev) => (prev < studentsList.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowLeft') {
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [studentsList.length, onClose]);

    const currentStudent = studentsList[currentIndex];
    if (!currentStudent) return null;

    const src = currentStudent.evidenceBase64 || currentStudent.evidence;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
            <button 
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => Math.max(0, prev - 1)); }}
                disabled={currentIndex === 0}
                className="absolute left-4 md:left-8 text-white p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all backdrop-blur-sm z-10"
            >
                <FaChevronLeft size={24} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => Math.min(studentsList.length - 1, prev + 1)); }}
                disabled={currentIndex === studentsList.length - 1}
                className="absolute right-4 md:right-8 text-white p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all backdrop-blur-sm z-10"
            >
                <FaChevronRight size={24} />
            </button>

            <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-slate-800 font-bold flex items-center gap-2">
                        <MdImage className="text-indigo-600"/> Evidence Snapshot 
                        <span className="text-[10px] text-slate-500 font-mono ml-2">({currentIndex + 1} of {studentsList.length})</span>
                        {isOffline && <span className="text-[10px] text-rose-600 bg-rose-100 px-2 py-0.5 rounded border border-rose-200 uppercase ml-2">Offline Cache</span>}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors bg-white p-2 rounded-full border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 shadow-sm">
                        <FaTimes size={14} />
                    </button>
                </div>
                <div className="flex-grow bg-slate-100 flex items-center justify-center p-4 overflow-hidden relative min-h-[50vh]">
                    <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                    <img key={src} src={src} alt="Evidence" className="max-h-[70vh] w-auto object-contain rounded-lg shadow-md relative z-10 animate-in fade-in zoom-in-95 duration-200" />
                </div>
                <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
                    <div>
                        <span className="text-sm font-bold text-slate-800">{currentStudent.name || "Unknown Student"}</span>
                        <span className="text-[11px] font-mono text-slate-500 ml-2">{currentStudent.enrollment}</span>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase rounded border border-indigo-100">CCTV Verified</span>
                </div>
            </div>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-[10px] font-mono uppercase tracking-widest hidden md:block">
                Use ← → arrow keys to navigate
            </div>
        </div>
    );
};

const SenderModal = ({ queue, onClose, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [manualPhone, setManualPhone] = useState("");
    const [isInputtingPhone, setIsInputtingPhone] = useState(false);
    const [copyStatus, setCopyStatus] = useState("idle"); 

    const student = queue[currentIndex];

    useEffect(() => {
        if (student) {
            const clean = cleanPhoneNumber(student.phone);
            if (clean && clean.length >= 10) {
                setManualPhone(clean);
                setIsInputtingPhone(false);
            } else {
                setManualPhone("");
                setIsInputtingPhone(true);
            }
            setCopyStatus("idle");
        }
    }, [currentIndex, student]);

    const handleNext = () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => handleNext();

    const handleSendAndNext = async () => {
        const finalPhone = cleanPhoneNumber(manualPhone);
        if (!finalPhone || finalPhone.length < 10) {
            alert("Please enter a valid mobile number including country code (e.g. 919876543210)");
            setIsInputtingPhone(true);
            return;
        }

        let message = "";

        if (student.disciplined) {
            // Positive Message for Disciplined Students
            message = `*Discipline Appreciation*\n\nStudent: ${student.name}\nEnrollment: ${student.enrollment}\nTime: ${formatTime12Hour(student.entryTime)}\n\nThank you for strictly maintaining the college dress code and discipline today. Keep up the good work!\n\nEvidence snapshot is attached below.`;
        } else {
            // Detailed Violation Message
            let violationsList = [];
            if (!student.hasId) violationsList.push("No ID Card");
            if (!student.isTucked) violationsList.push("Shirt Untucked");
            if (!student.hasWhiteShirt) violationsList.push("Improper Uniform");
            
            const violationText = violationsList.length > 0 ? violationsList.join(", ") : "General Discipline Violation";

            message = `*Discipline Alert*\n\nStudent: ${student.name}\nEnrollment: ${student.enrollment}\nViolation(s): ${violationText}\nTime: ${formatTime12Hour(student.entryTime)}\n\nEvidence is attached below. Please ensure strict compliance with the college dress code and discipline rules going forward.`;
        }

        const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;

        if (student.evidenceBase64 || student.evidence) {
            setCopyStatus("copying");
            try {
                await copyImageToClipboard(student.evidenceBase64 || student.evidence);
                setCopyStatus("success");
            } catch (err) {
                console.error("Clipboard failed even with conversion:", err);
                setCopyStatus("error");
                alert("Clipboard copy failed. Please right-click the image and select 'Copy Image' manually.");
            }
        }

        window.open(url, '_blank');
        handleNext();
    };

    if (!student) return null;

    const progress = Math.round(((currentIndex) / queue.length) * 100);
    const isGood = student.disciplined;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="relative max-w-lg w-full flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-slate-800 font-bold flex items-center gap-2">
                            <FaWhatsapp className="text-emerald-500 text-xl"/> 
                            WhatsApp Dispatcher
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FaTimes/></button>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 text-right font-mono">{currentIndex + 1} / {queue.length}</p>
                </div>
                
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex gap-4 items-start">
                        <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative group">
                            <img src={student.evidenceBase64 || student.evidence} className="w-full h-full object-cover" alt="Preview"/>
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaCamera/>
                            </div>
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-slate-800 text-xl leading-tight">{student.name}</h4>
                            <div className="text-xs font-mono text-slate-500 mb-2">{student.enrollment}</div>
                            
                            {isGood ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold uppercase tracking-wider">
                                    <MdCheckCircle size={10}/> Compliant / Good
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-bold uppercase tracking-wider">
                                    <FaExclamationTriangle size={10}/> Needs Alert
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                            Destination Number (WhatsApp)
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <FaPhone className="absolute left-3 top-3 text-slate-400" size={12}/>
                                <input 
                                    type="text" 
                                    value={manualPhone}
                                    onChange={(e) => setManualPhone(e.target.value)}
                                    placeholder="Enter 10-digit mobile"
                                    className={`w-full pl-9 pr-3 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 
                                    ${isInputtingPhone ? 'border-rose-300 ring-rose-100' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'}`}
                                />
                            </div>
                        </div>
                        {isInputtingPhone && <p className="text-[10px] text-rose-500 mt-1 font-medium">* Phone number missing or invalid. Please enter manually.</p>}
                    </div>

                    <div className={`text-xs p-3 rounded-lg border flex gap-2 transition-colors duration-300
                        ${copyStatus === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                          copyStatus === 'copying' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 
                          'bg-blue-50 border-blue-100 text-slate-500'}`}>
                        <div className="shrink-0 mt-0.5">
                            {copyStatus === 'success' ? <FaCheck /> : copyStatus === 'copying' ? <FaSpinner className="animate-spin"/> : <FaClipboardList />}
                        </div>
                        <p>
                           {copyStatus === 'success' 
                             ? <strong>Evidence Copied! Ready to Paste (Ctrl+V) in WhatsApp.</strong>
                             : copyStatus === 'copying' 
                               ? "Converting and copying image..." 
                               : "Clicking 'Send' will copy the evidence image and open WhatsApp. You just need to Paste (Ctrl+V)."}
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                      <button onClick={handleSkip} className="text-slate-400 text-xs font-bold uppercase tracking-wider hover:text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                        Skip
                      </button>
                      
                      <button 
                         onClick={handleSendAndNext}
                         disabled={copyStatus === 'copying'}
                         className={`px-6 py-3 disabled:bg-slate-400 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95 hover:-translate-y-0.5
                         ${isGood ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                      >
                         {copyStatus === 'copying' ? "Processing..." : <><FaWhatsapp size={16}/> {isGood ? "Send Thanks" : "Send Alert"} <FaArrowRightSolid size={10}/></>}
                      </button>
                </div>
             </div>
        </div>
    );
};

const BulkMessageModal = ({ message, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="relative max-w-2xl w-full flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-slate-800 font-bold flex items-center gap-2"><FaClipboardList className="text-indigo-600"/> Generated Report</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                        <FaTimes size={16} />
                    </button>
                </div>
                <div className="p-6 bg-slate-50">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                        <textarea 
                            readOnly 
                            value={message} 
                            className="w-full h-64 bg-transparent text-sm font-mono text-slate-700 focus:outline-none resize-none custom-scrollbar"
                        />
                        <button 
                            onClick={handleCopy}
                            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
                        >
                            {copied ? <MdCheckCircle /> : <FaCopy />} {copied ? "Copied" : "Copy"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const DepartmentDashboard = () => {
  const [activeTab, setActiveTab] = useState('actions');
  const navigate = useNavigate();

  const [currentDept] = useState({ 
    name: localStorage.getItem('dept_name') || 'Computer Engineering', 
    code: 'AN' 
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const studentsRef = useRef([]); 
    
  // --- FILTER STATES ---
  const [selectedYear, setSelectedYear] = useState('Third');
  const [filterType, setFilterType] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'entryTime', direction: 'desc' });
  
  // Date and Time Filter States
  const [filterDate, setFilterDate] = useState(''); 
  const [filterStartTime, setFilterStartTime] = useState(''); 
  const [filterEndTime, setFilterEndTime] = useState(''); 

  // Analytics View States
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('month'); 
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState('');
  const [analyticsFilter, setAnalyticsFilter] = useState('all'); 
  const [analyticsYear, setAnalyticsYear] = useState('All'); 

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [viewEvidenceIndex, setViewEvidenceIndex] = useState(null); 
  const [bulkMessage, setBulkMessage] = useState(null);
  const [senderQueue, setSenderQueue] = useState(null);

  // For singular Analytics image view
  const [analyticsEvidence, setAnalyticsEvidence] = useState(null);

  const [realtimeCounts, setRealtimeCounts] = useState({
    hasData: false,
    raw: null
  });

  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  // --- 1. Fetch Data ---
  useEffect(() => {
    let isMounted = true;

    const cachedData = localStorage.getItem('dashboard_cache');
    if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setStudents(parsed);
        studentsRef.current = parsed;
        setLoading(false);
    }

    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/entries");
        if (!res.ok) throw new Error("Flask API error");
        const json = await res.json();
        
        const currentData = studentsRef.current;
        
        const normalized = await Promise.all(json.map(async (item, idx) => {
            const tempId = item.id ?? idx + 1;
            const existing = currentData.find(s => s.id === tempId);
            
            let evidenceUrl = item.image_path ? `http://localhost:5000/evidence?path=${encodeURIComponent(item.image_path)}` : null;
            let evidenceBase64 = existing?.evidenceBase64 || null;

            if (evidenceUrl && !evidenceBase64) {
                try {
                    const imgRes = await fetch(evidenceUrl);
                    if (imgRes.ok) {
                        const blob = await imgRes.blob();
                        evidenceBase64 = await blobToBase64(blob);
                    }
                } catch (imgErr) { }
            }

            return {
                id: tempId,
                enrollment: String(item.enrollment ?? "UNKNOWN"),
                name: item.name ?? "Unknown",
                phone: item.phone || item.mobile || item.contact || "", 
                year: mapYear(item.year),
                entryTime: item.time || "00:00:00", 
                department: item.department || "General", 
                hasId: item.id_card === 1, 
                isTucked: item.shirt_tucked === 1, 
                hasWhiteShirt: item.white_shirt === 1, 
                disciplined: item.discipline === 1, 
                evidence: evidenceUrl,
                evidenceBase64: evidenceBase64,
                filePath: item.image_path,
                originalDate: item.date 
            };
        }));

        const deptFiltered = normalized.filter(s => 
            currentDept.name === 'General Department' || 
            (s.department && s.department.toLowerCase().includes('an') || true) 
        );

        if (isMounted) {
          setStudents(deptFiltered);
          setLoading(false);
          setIsOffline(false);
          
          try {
            localStorage.setItem('dashboard_cache', JSON.stringify(deptFiltered));
          } catch (storageErr) {
            const lightData = deptFiltered.map(s => ({...s, evidenceBase64: null}));
            localStorage.setItem('dashboard_cache', JSON.stringify(lightData));
          }
        }
      } catch (err) {
        console.error("Backend offline");
        if (isMounted) setIsOffline(true);
      }
    };

    fetchData(); 
    const interval = setInterval(fetchData, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [currentDept.name]);

  // --- 2. Fetch Live Counts ---
  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
        try {
            const res = await fetch("http://localhost:5000/counts");
            if (res.ok) {
                const data = await res.json();
                if (isMounted) {
                    setRealtimeCounts({
                        hasData: true,
                        raw: data
                    });
                }
            }
        } catch (err) { }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 1000); 
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  // --- MEMOS ---

  const stats = useMemo(() => {
    const dc = currentDept.code.toLowerCase(); 
    
    if (realtimeCounts.hasData && realtimeCounts.raw) {
        const raw = realtimeCounts.raw;
        const disciplined = raw[`disciplined_${dc}`] || 0;
        const undisciplined = raw[`undisciplined_${dc}`] || 0;
        const total = disciplined + undisciplined;
        const rate = raw[`discipline_rate_${dc}`] || 0;

        return { total, disciplined, undisciplined, rate };
    }
    
    const total = students.length;
    const disciplined = students.filter(s=>s.disciplined).length;
    const undisciplined = total - disciplined;
    const rate = total === 0 ? 0 : Math.round((disciplined / total) * 100);
    
    return { total, disciplined, undisciplined, rate };
  }, [realtimeCounts, students, currentDept.code]);

  const graphData = useMemo(() => {
    const buckets = {};
    const startHour = 8;
    const endHour = 17; 
    
    let currentH = startHour;
    let currentM = 0;

    while (currentH < endHour || (currentH === endHour && currentM === 0)) {
        const hStr = currentH.toString().padStart(2, '0');
        const mStr = currentM.toString().padStart(2, '0');
        buckets[`${hStr}:${mStr}`] = 0;

        currentM += 30; 
        if (currentM === 60) {
            currentH++;
            currentM = 0;
        }
    }

    students.forEach(s => {
        if (!s.entryTime) return;
        const [hStr, mStr] = s.entryTime.split(':');
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        const totalMins = h * 60 + m;

        const roundedMins = Math.floor(totalMins / 30) * 30;
        const bucketH = Math.floor(roundedMins / 60);
        const bucketM = roundedMins % 60;
        
        const key = `${bucketH.toString().padStart(2, '0')}:${bucketM.toString().padStart(2, '0')}`;

        if (buckets[key] !== undefined) {
            buckets[key]++;
        }
    });

    return Object.entries(buckets).map(([time, count]) => ({ time, count }));
  }, [students]);

  const summaryData = useMemo(() => {
    const base = { strength: 0, scanned: 0, recognized: 0, disciplined: 0, undisciplined: 0, noId: 0, untucked: 0, rate: 0 };
    
    if (realtimeCounts.hasData && realtimeCounts.raw) {
        const raw = realtimeCounts.raw;
        const dc = currentDept.code.toLowerCase(); 
        
        const mapApiYear = (suffix) => {
            const disc = raw[`disciplined_${dc}_${suffix}`] || 0;
            const undisc = raw[`undisciplined_${dc}_${suffix}`] || 0;
            return {
                strength: disc + undisc,
                scanned: disc + undisc,
                recognized: raw[`recognized_${dc}_${suffix}`] || 0,
                disciplined: disc,
                undisciplined: undisc,
                noId: raw[`id_card_no_${dc}_${suffix}`] || 0,
                untucked: raw[`untucked_${dc}_${suffix}`] || 0,
                rate: raw[`discipline_rate_${dc}_${suffix}`] || 0
            };
        };

        return {
            First: mapApiYear('fy'),
            Second: mapApiYear('sy'),
            Third: mapApiYear('ty'),
            Unknown: { ...base }
        };
    }

    const data = { First: {...base}, Second: {...base}, Third: {...base}, Unknown: {...base} };
    
    students.forEach(s => {
        const yKey = (s.year === 'Unknown' || !data[s.year]) ? 'Unknown' : s.year;
        const y = data[yKey];
        if (!y) return;
        
        y.strength++;
        y.scanned++;
        if (s.name !== 'Unknown') y.recognized++;
        
        if (s.disciplined) y.disciplined++;
        else {
            y.undisciplined++;
            if (!s.hasId) y.noId++;
            if (!s.isTucked) y.untucked++;
        }
    });

    Object.keys(data).forEach(k => {
        const y = data[k];
        y.rate = y.strength === 0 ? 0 : Math.round((y.disciplined / y.strength) * 100);
    });
    return data;
  }, [students, realtimeCounts, currentDept.code]);

  // --- FILTERING (LIVE ACTIONS) ---
  const filteredStudents = useMemo(() => {
    let data;

    if (selectedYear === 'Unknown') {
        data = students.filter(s => s.year === 'Unknown' || s.name === 'Unknown');
    } else {
        data = students.filter(s => s.year === selectedYear);
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        data = data.filter(s => 
            s.name.toLowerCase().includes(q) || 
            s.enrollment.toLowerCase().includes(q)
        );
    }

    if (filterDate) {
        data = data.filter(s => s.originalDate === filterDate);
    }
    if (filterStartTime) {
        data = data.filter(s => s.entryTime >= filterStartTime);
    }
    if (filterEndTime) {
        data = data.filter(s => s.entryTime <= filterEndTime);
    }

    if (filterType === 'disciplined') data = data.filter(s => s.disciplined);
    if (filterType === 'undisciplined') data = data.filter(s => !s.disciplined);
    if (filterType === 'noId') data = data.filter(s => !s.hasId);
    if (filterType === 'untucked') data = data.filter(s => !s.isTucked);
    if (filterType === 'improperUniform') data = data.filter(s => !s.hasWhiteShirt); 

    data.sort((a, b) => {
        if (sortConfig.key === 'entryTime') {
            const dA = a.originalDate || '';
            const dB = b.originalDate || '';
            const tA = a.entryTime || '';
            const tB = b.entryTime || '';
            
            if (dA !== dB) {
                return sortConfig.direction === 'asc' ? dA.localeCompare(dB) : dB.localeCompare(dA);
            }
            return sortConfig.direction === 'asc' ? tA.localeCompare(tB) : tB.localeCompare(tA);
        }

        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return data;
  }, [students, selectedYear, filterType, searchQuery, sortConfig, filterDate, filterStartTime, filterEndTime]);

  // --- ANALYTICS DATA MEMO ---
  const analyticsData = useMemo(() => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Only recognized students
      let baseData = students.filter(s => s.name !== 'Unknown');

      // 1. Timeframe
      if (analyticsTimeframe === 'week') {
          baseData = baseData.filter(s => new Date(s.originalDate) >= sevenDaysAgo);
      } else if (analyticsTimeframe === 'month') {
          baseData = baseData.filter(s => new Date(s.originalDate) >= thirtyDaysAgo);
      }

      // 2. Year Filter
      if (analyticsYear !== 'All') {
          baseData = baseData.filter(s => s.year === analyticsYear);
      }

      // 3. Type Filter
      if (analyticsFilter === 'disciplined') baseData = baseData.filter(s => s.disciplined);
      if (analyticsFilter === 'undisciplined') baseData = baseData.filter(s => !s.disciplined);
      if (analyticsFilter === 'noId') baseData = baseData.filter(s => !s.hasId);
      if (analyticsFilter === 'untucked') baseData = baseData.filter(s => !s.isTucked);
      if (analyticsFilter === 'improperUniform') baseData = baseData.filter(s => !s.hasWhiteShirt);

      // 4. Search Filter
      if (analyticsSearchQuery) {
          const q = analyticsSearchQuery.toLowerCase();
          baseData = baseData.filter(s => 
              s.name.toLowerCase().includes(q) || 
              s.enrollment.toLowerCase().includes(q)
          );
      }

      // 5. Aggregate Top Violators
      const studentMap = {};
      baseData.forEach(s => {
          if (!studentMap[s.enrollment]) {
              studentMap[s.enrollment] = {
                  name: s.name,
                  enrollment: s.enrollment,
                  totalEntries: 0,
                  violations: 0,
                  noId: 0,
                  untucked: 0,
                  improperUniform: 0,
                  lastSeen: s.originalDate,
                  department: s.department,
                  year: s.year,
                  latestEntry: s 
              };
          }
          const st = studentMap[s.enrollment];
          st.totalEntries++;
          if (!s.disciplined) st.violations++;
          if (!s.hasId) st.noId++;
          if (!s.isTucked) st.untucked++;
          if (!s.hasWhiteShirt) st.improperUniform++;
          
          if (s.originalDate > st.lastSeen || (s.originalDate === st.lastSeen && s.entryTime > st.latestEntry.entryTime)) {
              st.lastSeen = s.originalDate;
              st.latestEntry = s; 
          }
      });

      // Sort by number of violations descending
      const topViolators = Object.values(studentMap)
          .sort((a, b) => b.violations - a.violations);

      return { baseData, topViolators };
  }, [students, analyticsTimeframe, analyticsYear, analyticsSearchQuery, analyticsFilter]);


  const toggleSelect = (id) => {
    if (selectedStudents.includes(id)) setSelectedStudents(prev => prev.filter(sid => sid !== id));
    else setSelectedStudents(prev => [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length && filteredStudents.length > 0) setSelectedStudents([]);
    else setSelectedStudents(filteredStudents.map(s => s.id));
  };

  const handleGenerateBulkMessage = () => {
    if (selectedStudents.length === 0) return;
    const selectedList = students.filter(s => selectedStudents.includes(s.id));
    const noIdList = selectedList.filter(s => !s.hasId);
    const untuckedList = selectedList.filter(s => !s.isTucked);
    const improperList = selectedList.filter(s => !s.hasWhiteShirt);
    const allList = selectedList.filter(s => !s.disciplined); 

    let msg = "Following students have been noticed as Undisciplined Today,\n\n";

    if (noIdList.length > 0) {
        msg += "violation type : no id\n";
        noIdList.forEach(s => msg += `"${s.name}" "${s.enrollment}"\n`);
        msg += "\n";
    }
    if (untuckedList.length > 0) {
        msg += "violation type : shirt untucked\n";
        untuckedList.forEach(s => msg += `"${s.name}" "${s.enrollment}"\n`);
        msg += "\n";
    }
    if (improperList.length > 0) {
        msg += "violation type : improper uniform\n";
        improperList.forEach(s => msg += `"${s.name}" "${s.enrollment}"\n`);
        msg += "\n";
    }
    if (allList.length > 0 && noIdList.length === 0 && untuckedList.length === 0 && improperList.length === 0) {
        msg += "violation type: general discipline\n";
        allList.forEach(s => msg += `"${s.name}" "${s.enrollment}"\n`);
        msg += "\n";
    }
    msg += "strictly maintain discipline from tomorrow.";
    setBulkMessage(msg);
  };

  const handleOpenSender = () => {
    const selectedList = students.filter(s => selectedStudents.includes(s.id));
    if (selectedList.length === 0) {
        alert("No students selected.");
        return;
    }
    setSenderQueue(selectedList);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-sans animate-pulse">Initializing Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-['Poppins'] tracking-tight selection:bg-indigo-100 selection:text-indigo-900">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }
        .sticky-header { position: sticky; top: 0; z-index: 20; backdrop-filter: blur(8px); background: rgba(255,255,255,0.95); }
        input[type="date"], input[type="time"] { color-scheme: light; cursor: pointer; }
      `}} />

      {/* --- MODALS --- */}
      {viewEvidenceIndex !== null && (
          <ImageModal 
            initialIndex={viewEvidenceIndex}
            studentsList={filteredStudents}
            isOffline={isOffline}
            onClose={() => setViewEvidenceIndex(null)} 
          />
      )}
      {/* Fallback specific modal for singular student triggers (Analytics tab) */}
      {analyticsEvidence !== null && (
          <ImageModal 
            initialIndex={0}
            studentsList={[analyticsEvidence]}
            isOffline={isOffline}
            onClose={() => setAnalyticsEvidence(null)} 
          />
      )}
      {bulkMessage && <BulkMessageModal message={bulkMessage} onClose={() => setBulkMessage(null)} />}
      
      {/* NEW SENDER MODAL */}
      {senderQueue && (
          <SenderModal 
            queue={senderQueue} 
            onClose={() => setSenderQueue(null)}
            onComplete={() => {
                setSenderQueue(null);
                alert("All selected alerts processed.");
                setSelectedStudents([]);
            }}
          />
      )}

      {/* --- HEADER --- */}
      <header className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-center mb-8 gap-6 relative z-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-[11px] font-bold tracking-widest text-indigo-700 uppercase flex items-center gap-2">
                  <MdSettingsRemote /> Department Dashboard
                </span>
                {isOffline ? (
                   <span className="px-3 py-1 rounded-full border border-rose-200 bg-rose-50 text-[11px] font-bold tracking-widest text-rose-600 uppercase flex items-center gap-2">
                      <MdWifiOff /> Offline Mode
                   </span>
                ) : (
                  <span className="px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-bold tracking-widest text-emerald-600 uppercase flex items-center gap-2">
                      <MdWifi /> System Online
                   </span>
                )}
           </div>
           <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 uppercase leading-none">
              {currentDept.name}
           </h1>
        </div>

        <nav className="flex flex-wrap p-1.5 bg-white border border-slate-200 shadow-sm rounded-xl gap-1 items-center justify-center">
          {[
              { id: 'stats', label: 'Overview' },
              { id: 'summary', label: 'Yearly Summary' },
              { id: 'actions', label: 'Live Actions' },
              { id: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 relative overflow-hidden
              ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              {tab.label}
            </button>
          ))}
          <button onClick={handleLogout} className="ml-2 px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-100 hover:border-rose-600 transition-all duration-200 flex items-center gap-2">
            <MdLogout size={14} /> 
          </button>
        </nav>
      </header>

      <main className="max-w-[1600px] mx-auto min-h-[700px] relative">
        
        {/* --- TAB 1: STATISTICS --- */}
        {activeTab === 'stats' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <ProCard className="p-8 h-[350px] md:h-[400px]">
                  <div className="absolute top-6 left-8 z-10">
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2"><FaChartBar className="text-indigo-600"/> Entry Analytics</h3>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={graphData} margin={{ top: 60, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                        itemStyle={{color: '#1e293b', fontWeight: 'bold'}} 
                        labelStyle={{color: '#64748b', fontSize: '11px'}}
                      />
                      <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </ProCard>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                      { label: 'Total Visits', val: stats.total, color: '#3b82f6', icon: <FaUsers/>, bg: 'bg-blue-50' },
                      { label: 'Disciplined', val: stats.disciplined, color: '#10b981', icon: <FaUserCheck/>, bg: 'bg-emerald-50' },
                      { label: 'Violations', val: stats.undisciplined, color: '#f43f5e', icon: <FaUserTimes/>, bg: 'bg-rose-50' },
                      { label: 'Compliance', val: `${stats.rate}%`, color: '#f59e0b', icon: <MdTrendingUp/>, bg: 'bg-amber-50' },
                  ].map((stat, idx) => (
                      <ProCard key={idx} className="p-6 hover:-translate-y-1 transition-transform duration-300">
                          <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-xl text-xl shadow-sm ${stat.bg}`} style={{color: stat.color}}>{stat.icon}</div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
                          </div>
                          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">{stat.val}</h2>
                      </ProCard>
                  ))}
              </div>
          </div>
        )}

        {/* --- TAB 2: YEARLY SUMMARY --- */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300 h-full">
             {['First', 'Second', 'Third'].map((year, idx) => {
                 const data = summaryData[year];
                 const colors = ['#3b82f6', '#8b5cf6', '#f43f5e']; 
                 const bgColors = ['bg-blue-50', 'bg-violet-50', 'bg-rose-50'];
                 const accent = colors[idx];
                 return (
                    <div key={year} className="bg-white rounded-[1.5rem] p-8 flex flex-col relative overflow-hidden group border-t-4 shadow-sm border-x border-b border-slate-200" style={{ borderTopColor: accent }}>
                        <div className="flex justify-between items-end mb-8 relative z-10">
                            <div>
                                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase leading-none">{year}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Year Report</p>
                            </div>
                            <div className={`text-center p-2.5 rounded-xl border border-slate-200 ${bgColors[idx]}`}>
                                <span className="text-2xl font-black tracking-tighter block leading-none" style={{color: accent}}>{data.rate}%</span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Score</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                            <SummaryRow label="Total Scanned" value={data.scanned} color="#3b82f6" icon={<MdOutlineShield/>} />
                            <SummaryRow label="Recognized" value={data.recognized} color="#10b981" icon={<FaUserCheck/>} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                                <div className="text-2xl font-black text-emerald-700">{data.disciplined}</div>
                                <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Pass</div>
                            </div>
                            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
                                <div className="text-2xl font-black text-rose-700">{data.undisciplined}</div>
                                <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Fail</div>
                            </div>
                        </div>

                        <div className="flex-grow flex flex-col justify-end">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Top Violations</p>
                            <SummaryRow small label="No ID Card" value={data.noId} color="#ef4444" icon={<FaIdCard/>} />
                            <SummaryRow small label="Shirt Untucked" value={data.untucked} color="#eab308" icon={<FaTshirt/>} />
                        </div>
                    </div>
                 )
             })}
          </div>
        )}

        {/* --- TAB 3: LIVE ACTIONS --- */}
        {activeTab === 'actions' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-500 min-h-[750px]">
            
            <div className="bg-white border border-slate-200 p-4 rounded-2xl mb-6 flex flex-col xl:flex-row gap-4 justify-between items-center relative z-20 shadow-sm">
                
                {/* FILTER GROUP 1: SEARCH & YEAR */}
                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {['First', 'Second', 'Third', 'Unknown'].map(y => (
                            <button key={y} onClick={() => setSelectedYear(y)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                                ${selectedYear === y ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                {y}
                            </button>
                        ))}
                    </div>
                    <div className="relative group flex-grow xl:flex-grow-0">
                        <FaSearch className="absolute left-3 top-3 text-slate-400" size={12}/>
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Name or ID..." 
                            className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full xl:w-48 transition-all placeholder:text-slate-400" 
                        />
                    </div>
                </div>

                {/* FILTER GROUP 2: DATE & TIME */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <div className="relative flex items-center">
                        <FaCalendarAlt className="absolute left-3 text-slate-400" size={10}/>
                        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                            className="pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 focus:outline-none focus:border-indigo-500 w-32" 
                        />
                    </div>
                    <div className="h-4 w-px bg-slate-300 mx-1"></div>
                    <div className="flex items-center gap-1">
                        <FaClock className="text-slate-400" size={10}/>
                        <input type="time" value={filterStartTime} onChange={(e) => setFilterStartTime(e.target.value)}
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 focus:outline-none focus:border-indigo-500" 
                        />
                        <span className="text-slate-400 text-[10px]"><FaArrowRight size={8}/></span>
                        <input type="time" value={filterEndTime} onChange={(e) => setFilterEndTime(e.target.value)}
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 focus:outline-none focus:border-indigo-500" 
                        />
                    </div>
                    {(filterDate || filterStartTime || filterEndTime) && (
                        <button onClick={() => { setFilterDate(''); setFilterStartTime(''); setFilterEndTime(''); }} className="ml-1 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <FaTimes size={10}/>
                        </button>
                    )}
                </div>

                {/* FILTER GROUP 3: TYPE */}
                <div className="flex overflow-x-auto gap-2 w-full xl:w-auto pb-2 xl:pb-0 custom-scrollbar">
                    {[
                      { id: 'all', label: 'All', activeClass: 'bg-slate-800 text-white', icon: null },
                      { id: 'disciplined', label: 'Disciplined', activeClass: 'bg-emerald-600 text-white', icon: <FaCheckSquare size={10}/> },
                      { id: 'undisciplined', label: 'Violations', activeClass: 'bg-orange-600 text-white', icon: <FaExclamationTriangle size={10}/> },
                      { id: 'noId', label: 'No ID', activeClass: 'bg-rose-600 text-white', icon: <FaIdCard size={10}/> },
                      { id: 'untucked', label: 'Untucked', activeClass: 'bg-yellow-600 text-white', icon: <FaTshirt size={10}/> },
                      { id: 'improperUniform', label: 'Uniform', activeClass: 'bg-purple-600 text-white', icon: <FaUserShield size={10}/> },
                    ].map(f => (
                      <button key={f.id} onClick={() => setFilterType(f.id)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-2
                        ${filterType === f.id ? `${f.activeClass} shadow-md border-transparent` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        {f.icon} {f.label}
                      </button>
                    ))}
                </div>
            </div>

            <ProCard className="flex-grow flex flex-col h-[600px] relative"> 
                {/* LIST HEADER (Compact Attributes) */}
                <div className="sticky-header grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <div className="col-span-1 flex items-center gap-2">
                        <button onClick={toggleSelectAll} className="hover:text-indigo-600 transition-colors">
                            {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 ? <FaCheckSquare className="text-indigo-600" /> : <FaSquare />}
                        </button>
                    </div>
                    <div className="col-span-3">Profile</div>
                    <div className="col-span-4">Observed Status</div>
                    <div className="col-span-2 text-center">Time</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-0 pb-32 bg-slate-50/50">
                    {filteredStudents.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                            <FaUserSecret size={48} className="mb-4 opacity-30 text-slate-300"/>
                            <p className="text-sm font-medium">No records found matching filters</p>
                        </div>
                    ) : (
                        filteredStudents.map((student, idx) => {
                            const showHeader = idx === 0 || student.originalDate !== filteredStudents[idx - 1].originalDate;
                            
                            return (
                                <React.Fragment key={student.id}>
                                    {showHeader && (
                                        <div className="px-6 py-2 bg-slate-100/80 border-y border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 shadow-sm sticky top-0 z-10 backdrop-blur-sm">
                                            <FaCalendarAlt /> {formatDateFriendly(student.originalDate)}
                                        </div>
                                    )}
                                    <div onClick={() => toggleSelect(student.id)} 
                                        className={`grid grid-cols-12 gap-4 items-center px-6 py-3 border-b border-slate-100 transition-all duration-200 cursor-pointer group relative hover:scale-[1.01] hover:shadow-lg hover:z-20 hover:border-indigo-100
                                        ${selectedStudents.includes(student.id) 
                                            ? 'bg-indigo-50/60 shadow-sm z-10' 
                                            : 'bg-white hover:bg-slate-50'}`}>
                                        
                                        <div className="col-span-1 flex items-center gap-3 relative z-10">
                                            <div className={`${selectedStudents.includes(student.id) ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                                {selectedStudents.includes(student.id) ? <FaCheckSquare size={16}/> : <FaSquare size={16}/>}
                                            </div>
                                            <span className="font-mono text-[9px] text-slate-400">#{idx + 1}</span>
                                        </div>

                                        <div className="col-span-3 flex items-center gap-3 relative z-10">
                                            <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold capitalize shadow-sm border
                                                ${student.disciplined 
                                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                                    : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                                {student.name ? student.name.charAt(0) : '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800 leading-tight capitalize truncate max-w-[130px]">{student.name}</h4>
                                                <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block border border-slate-200">{student.enrollment}</span>
                                            </div>
                                        </div>

                                        {/* Reduced Attribute Text */}
                                        <div className="col-span-4 flex flex-wrap justify-start gap-1.5 relative z-10">
                                            {student.disciplined ? (
                                                <span className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                    <MdCheckCircle size={10}/> Compliant
                                                </span>
                                            ) : (
                                                <>
                                                    {!student.hasId && (
                                                        <span className="px-2 py-1 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                            <FaIdCard /> No ID
                                                        </span>
                                                    )}
                                                    {!student.isTucked && (
                                                        <span className="px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                            <FaTshirt /> Untucked
                                                        </span>
                                                    )}
                                                    {!student.hasWhiteShirt && (
                                                        <span className="px-2 py-1 rounded-md bg-purple-50 border border-purple-100 text-purple-700 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                            <FaUserShield /> Uniform
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div className="col-span-2 text-center font-mono text-xs text-slate-600 font-medium relative z-10">
                                            {formatTime12Hour(student.entryTime)}
                                        </div>

                                        {/* Interactive Individual Actions */}
                                        <div className="col-span-2 flex justify-end gap-2 relative z-10">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setViewEvidenceIndex(idx); }} 
                                                className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-md" 
                                                title="View Proof">
                                                <FaCamera size={12} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSenderQueue([student]); }} 
                                                className={`p-2 rounded-lg border transition-all shadow-sm hover:shadow-md hover:text-white
                                                ${student.disciplined ? 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600'}`}
                                                title={student.disciplined ? "Send Thanks" : "Send Alert"}>
                                                <FaWhatsapp size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })
                    )}
                </div>
            </ProCard>

            {/* TRULY FLOATING BULK ACTION FOOTER */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl backdrop-blur-md bg-white/95 border border-slate-200/50 p-4 rounded-2xl shadow-2xl flex justify-between items-center transition-all duration-300 z-50 transform ring-1 ring-slate-900/5 ${selectedStudents.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
                  <div className="flex items-center gap-4 pl-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-lg shadow-indigo-300"></span>
                      <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Selected Action</p>
                          <p className="text-lg font-black text-slate-800 leading-none">{selectedStudents.length} Students</p>
                      </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                        onClick={handleOpenSender}
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold uppercase tracking-wider text-white shadow-xl shadow-emerald-200 hover:shadow-2xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <FaWhatsapp className="text-sm" /> Multi-Message
                    </button>
                    <button 
                        onClick={handleGenerateBulkMessage}
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-[11px] font-bold uppercase tracking-wider text-white shadow-xl shadow-indigo-200 hover:shadow-2xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <FaClipboardList className="text-sm" /> Generate Report
                    </button>
                  </div>
            </div>

          </div>
        )}

        {/* --- TAB 4: NEW ANALYTICS TAB --- */}
        {activeTab === 'analytics' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 min-h-[750px] flex flex-col gap-6">
                
                {/* Analytics Control Bar */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col lg:flex-row gap-4 justify-between items-center shadow-sm z-10 relative">
                    {/* Timeframe Toggles */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {[
                            { id: 'week', label: 'Last 7 Days' },
                            { id: 'month', label: 'Last 30 Days' },
                            { id: 'all', label: 'All Time' }
                        ].map(t => (
                            <button key={t.id} onClick={() => setAnalyticsTimeframe(t.id)}
                                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all
                                ${analyticsTimeframe === t.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Year Filter */}
                    <div className="flex bg-indigo-50 p-1 rounded-xl border border-indigo-100">
                        {['All', 'First', 'Second', 'Third'].map(y => (
                            <button key={y} onClick={() => setAnalyticsYear(y)}
                                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all
                                ${analyticsYear === y ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-600/70 hover:text-indigo-800 hover:bg-indigo-100'}`}>
                                {y} {y !== 'All' && 'Year'}
                            </button>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex overflow-x-auto gap-2 custom-scrollbar">
                        {[
                            { id: 'all', label: 'All Violations', activeClass: 'bg-slate-800 text-white' },
                            { id: 'noId', label: 'No ID', activeClass: 'bg-rose-600 text-white' },
                            { id: 'untucked', label: 'Untucked', activeClass: 'bg-amber-600 text-white' },
                            { id: 'improperUniform', label: 'Bad Uniform', activeClass: 'bg-purple-600 text-white' }
                        ].map(f => (
                            <button key={f.id} onClick={() => setAnalyticsFilter(f.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all
                            ${analyticsFilter === f.id ? `${f.activeClass} shadow-md border-transparent` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                            {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Specific Student Search */}
                    <div className="relative group w-full lg:w-48">
                        <FaSearch className="absolute left-3 top-3.5 text-slate-400" size={14}/>
                        <input type="text" value={analyticsSearchQuery} onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
                            placeholder="Find student..." 
                            className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full transition-all placeholder:text-slate-400" 
                        />
                    </div>
                </div>

                {/* --- ANALYTICS LIST VIEW --- */}
                <ProCard className="flex-grow flex flex-col h-[600px] relative"> 
                    <div className="sticky-header grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-3">Student Profile</div>
                        <div className="col-span-2 text-center">Data Overview</div>
                        <div className="col-span-4 text-center">Violation Breakdown</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar p-0 pb-12 bg-slate-50/50">
                        {analyticsData.topViolators.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                                <FaUserCheck size={48} className="mb-4 opacity-30 text-slate-300"/>
                                <p className="text-sm font-medium">No violation data found for these filters.</p>
                            </div>
                        ) : (
                            analyticsData.topViolators.map((v, i) => (
                                <div key={v.enrollment} className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-slate-100 transition-all duration-200 hover:bg-white hover:shadow-lg hover:z-20 hover:scale-[1.01] hover:border-indigo-100 relative group">
                                    
                                    {/* Rank */}
                                    <div className="col-span-1 font-mono text-sm font-black text-slate-300 group-hover:text-indigo-400 transition-colors">
                                        #{i + 1}
                                    </div>

                                    {/* Profile */}
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold border border-slate-200 shadow-sm shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                                            {v.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800 leading-tight truncate max-w-[150px]">{v.name}</h4>
                                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block border border-slate-200">{v.enrollment}</span>
                                        </div>
                                    </div>

                                    {/* Entries / Violations */}
                                    <div className="col-span-2 flex justify-center items-center gap-4">
                                        <div className="text-center">
                                            <span className="block text-sm font-black text-slate-700">{v.totalEntries}</span>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Entries</span>
                                        </div>
                                        <div className="h-8 w-px bg-slate-200"></div>
                                        <div className="text-center bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 shadow-sm">
                                            <span className="block text-sm font-black text-rose-600 leading-none">{v.violations}</span>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-rose-400 mt-0.5 block">Violations</span>
                                        </div>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="col-span-4 flex flex-wrap justify-center gap-1.5">
                                        {v.noId > 0 && (
                                            <span className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-bold uppercase flex items-center gap-1.5 shadow-sm">
                                                <FaIdCard /> {v.noId} No ID
                                            </span>
                                        )}
                                        {v.untucked > 0 && (
                                            <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-bold uppercase flex items-center gap-1.5 shadow-sm">
                                                <FaTshirt /> {v.untucked} Untucked
                                            </span>
                                        )}
                                        {v.improperUniform > 0 && (
                                            <span className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-100 text-purple-700 text-[9px] font-bold uppercase flex items-center gap-1.5 shadow-sm">
                                                <FaUserShield /> {v.improperUniform} Uniform
                                            </span>
                                        )}
                                        {v.violations === 0 && (
                                            <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold uppercase flex items-center gap-1.5 shadow-sm">
                                                <MdCheckCircle /> Clean Record
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex justify-end gap-2">
                                        <button 
                                            onClick={() => setAnalyticsEvidence(v.latestEntry)} 
                                            className="p-2.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg transition-all border border-indigo-100 shadow-sm hover:shadow-md" 
                                            title="View Latest Proof"
                                        >
                                            <FaCamera size={14}/>
                                        </button>
                                        <button 
                                            onClick={() => setSenderQueue([v.latestEntry])} 
                                            className="p-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-lg transition-all border border-emerald-100 shadow-sm hover:shadow-md" 
                                            title="Send Alert"
                                        >
                                            <FaWhatsapp size={14}/>
                                        </button>
                                    </div>

                                </div>
                            ))
                        )}
                    </div>
                </ProCard>
            </div>
        )}

      </main>
    </div>
  );
};

export default DepartmentDashboard;