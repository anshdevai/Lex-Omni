import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, User, Scale, ShieldAlert, BookOpen, Volume2, VolumeX, Mic, Paperclip, StopCircle, PlayCircle, X, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  attachmentName?: string;
};

const getSystemInstruction = (userData: any) => `You are Lex-Omni, a Senior Constitutional Expert and Legal Intelligence Engine. Your core knowledge is the Constitution of India, IPC (BNS), and CrPC (BNSS).

SESSION CONTEXT:
- User Name: ${userData.name}
- Jurisdiction: ${userData.jurisdiction}
- Location: ${userData.location}
- Preferred Language: ${userData.language}

When processing user input:
1. Act as if the laws of ${userData.jurisdiction} are your underlying database.
2. You HAVE access to Google Search to fetch up-to-date rulings, news, and location-specific data.
3. If the user's issue requires police intervention, filing an FIR, or visiting a court, use their Location (${userData.location}) to tell them the nearest police station or relevant authority using Google Search. ALWAYS provide a direct Google Maps link to the location using Markdown link format (e.g., [Nearest Police Station](https://www.google.com/maps/search/?api=1&query=Nearest+Police+Station+${encodeURIComponent(userData.location)})).
4. The user can attach images and PDF documents directly for you to analyze. DO NOT claim you cannot read files! You can also draft legal document templates using Markdown.

Logic Flow you MUST follow for every user prompt:
1. Listen to the user's problem carefully.
2. Analyze the input/attachments. Link the issue to 'Constitutional Articles' and search your knowledge base for relevant sections.
3. Form the output to clearly address:
   - What to do now (Immediate actions) & nearest police station / authority based on their location: ${userData.location}
   - Is it a crime? (Civil vs Criminal)
   - Under which section/article it falls
   - How many years of jail (if applicable)
   - Step-by-step legal remedy
   - Any other relevant legal details.
4. Keep the output concise—reduce the length slightly so it's not overly verbose, but retain all critical legal information.
5. Multilingual translation: Speak in the user's preferred language (${userData.language}). If mixed, adapt comfortably. 
6. At the very end of your answer, you MUST include a disclaimer: "Disclaimer: This is 'Legal Information' and not 'Legal Advice'."

IMPORTANT: Write your responses in clear Markdown. Include bullet points, bold text for important legal terms, and keep a professional, empathetic, and highly authoritative tone.`;

const FloatingBackground = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  return (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#050a14]">
    {/* Ambient Glows - Navy/Blue Theme */}
    <motion.div
      animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      className="absolute top-[5%] left-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bg-blue-900/20 rounded-full blur-[120px]"
    />
    <motion.div
      animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.25, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[10%] right-[5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-indigo-600/10 rounded-full blur-[140px]"
    />
    <motion.div
      animate={{ x: [0, 30, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute top-[40%] right-[30%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-cyan-600/10 rounded-full blur-[100px]"
    />

    {/* Floating Particles for Aesthetic */}
    {mounted && Array.from({ length: 25 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: Math.random() * 0.5 + 0.1,
          scale: Math.random() * 0.5 + 0.5,
        }}
        animate={{
          y: [null, Math.random() * -200 - 100],
          x: [null, Math.random() * 100 - 50],
          opacity: [null, 0],
        }}
        transition={{
          duration: Math.random() * 15 + 15,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 5,
        }}
        className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"
      />
    ))}
    
    {/* Abstract Grid/Nodes overlay for a tech feel */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
  </div>
)};

const Typewriter = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="font-mono text-xs font-bold tracking-[0.2em] text-blue-400 uppercase drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">
      {displayed}
      <motion.span animate={{opacity:[0,1,0]}} transition={{repeat: Infinity, duration: 0.8}}>_</motion.span>
    </span>
  );
}

function Onboarding({ onComplete }: { onComplete: (data: any) => void }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: '', jurisdiction: 'Republic of India', location: '', language: 'English' });

  const steps = [
    { title: "Identify yourself before the Bench", subtitle: "Initializing Secure Connection...", label: "FULL NAME", key: 'name', placeholder: "e.g., Ansh Kumar" },
    { title: "State your Jurisdiction", subtitle: "Mapping Territorial Statutes...", label: "COUNTRY / REGION", key: 'jurisdiction', placeholder: "e.g., Republic of India" },
    { title: "What is your Location?", subtitle: "For nearest police stations & authorities...", label: "CITY / NEIGHBORHOOD", key: 'location', placeholder: "e.g., Connaught Place, New Delhi" },
    { title: "Declare Language of Proceedings", subtitle: "Calibrating Linguistic Parameters...", label: "PRIMARY LANGUAGE", key: 'language', placeholder: "e.g., English, Hindi" },
  ];

  const current = steps[step];

  useEffect(() => {
    // Automatically ask for location matching microphone API location style
    if (step === 2 && !formData.location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocode fallback or just pass coordinates
            setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          } catch (error) {
            console.error(error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete(formData);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <FloatingBackground />
      
      <div className="z-10 w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center gap-4 mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-700 p-4 rounded-2xl border border-white/20 shadow-2xl">
              <Scale className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Lex Omni</h1>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -20, filter: 'blur(8px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#0a1128]/80 backdrop-blur-2xl border border-blue-500/20 p-10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(59,130,246,0.1)_inset]"
          >
            <div className="mb-8 h-8 flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
               <Typewriter text={current.subtitle} />
            </div>

            <h2 className="font-serif text-3xl font-bold tracking-tight text-white mb-10 leading-snug drop-shadow-sm">
              {current.title}
            </h2>

            <div className="space-y-8">
              <div className="relative group">
                <label className="block text-[10px] font-bold tracking-widest text-blue-300/70 mb-3 uppercase">{current.label}</label>
                <input 
                  autoFocus
                  type="text"
                  value={(formData as any)[current.key]}
                  onChange={(e) => setFormData({ ...formData, [current.key]: e.target.value })}
                  placeholder={current.placeholder}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (formData as any)[current.key].trim()) {
                      handleNext();
                    }
                  }}
                  className="w-full bg-blue-950/20 border-b-2 border-blue-900/50 hover:border-blue-700 pb-3 pt-2 px-2 text-2xl font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-blue-400 focus:bg-blue-900/10 transition-all caret-blue-400"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!(formData as any)[current.key].trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold tracking-[0.2em] uppercase rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 relative overflow-hidden"
              >
                <span className="relative z-10">{step < steps.length - 1 ? 'PROCEED' : 'ENTER VAULT'}</span>
                <ChevronRight className="w-5 h-5 relative z-10" />
                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 ease-out" />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-14 flex justify-center gap-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ease-in-out ${i === step ? 'w-16 bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]' : i < step ? 'w-4 bg-blue-800' : 'w-4 bg-slate-800'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatApp({ userData }: { userData: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Greetings, **${userData.name}**. \n\nI am Lex-Omni, active in the jurisdiction of **${userData.jurisdiction}**. I am also calibrated to provide location-specific guidance for **${userData.location}** in **${userData.language}**. \n\nProceed with your query or furnish the necessary documents to begin analysis.`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachment, setAttachment] = useState<{name: string, data: string, mimeType: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN'; 
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(',')[1];
      setAttachment({
        name: file.name,
        data: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachment) return;
    if (isLoading) return;

    stopSpeaking();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim() || 'Attached a document for analysis.',
      sender: 'user',
      timestamp: new Date(),
      attachmentName: attachment?.name
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => {
          const parts: any[] = [{ text: m.text }];
          if (m.attachmentName) {
             parts.push({ text: `[User attached file: ${m.attachmentName}]` });
          }
          return {
            role: m.sender === 'user' ? 'user' : 'model',
            parts
          };
        });
      
      const currentUserParts: any[] = [{ text: userMessage.text }];
      if (attachment) {
        currentUserParts.push({
          inlineData: {
            data: attachment.data,
            mimeType: attachment.mimeType
          }
        });
      }
      
      history.push({ role: 'user', parts: currentUserParts });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: history,
        config: {
          systemInstruction: getSystemInstruction(userData),
          tools: [{ googleSearch: {} }],
        }
      });

      const botText = response.text || "I'm sorry, I couldn't generate a response.";
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setAttachment(null);
      if (autoRead) {
        speak(botText);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "System Exception: I encountered an error while processing your request. Please verify connection protocols or retry.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-slate-300 font-sans relative overflow-hidden">
      <FloatingBackground />
      
      {/* Dynamic Header */}
      <header className="bg-[#050a14]/60 backdrop-blur-2xl border-b border-blue-900/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-4 flex items-center justify-between z-20 sticky top-0 transition-all">
        <div className="flex items-center space-x-4 group cursor-pointer">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/20"
          >
            <Scale className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-wide text-white drop-shadow-md group-hover:text-blue-400 transition-colors">Lex Omni</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-blue-400/80 font-bold hidden sm:block">Legal Intelligence Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4 text-[10px] tracking-widest uppercase font-bold text-blue-200/50 bg-[#0a1128]/80 backdrop-blur-md py-2 px-5 rounded-full border border-blue-900/40 shadow-inner">
            <span className="flex items-center gap-1.5 hover:text-blue-300 transition-colors"><MapPin className="w-3 h-3 text-blue-500"/> {userData.location || userData.jurisdiction}</span>
            <span className="w-1 h-1 bg-blue-800/50 rounded-full hidden md:block"></span>
            <span className="flex items-center gap-1.5 text-emerald-400/80 hover:text-emerald-300 transition-colors"><ShieldAlert className="w-3 h-3 text-emerald-500"/> SECURE</span>
          </div>
          <button 
            onClick={() => setAutoRead(!autoRead)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border shadow-lg ${autoRead ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600/30' : 'bg-slate-900/50 text-slate-500 border-white/5 hover:bg-slate-800'}`}
            title="Toggle Auto Read"
          >
            {autoRead ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{autoRead ? 'Voice ON' : 'Voice OFF'}</span>
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 w-full z-10 scrollbar-thin scrollbar-thumb-blue-900/50 scrollbar-track-transparent">
        <div className="max-w-4xl mx-auto space-y-8 pb-32 mt-6">
          {messages.map((message) => (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ease: "easeOut", duration: 0.4 }}
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex max-w-[95%] md:max-w-[85%] ${
                  message.sender === 'user' 
                    ? 'flex-row-reverse' 
                    : 'flex-row'
                } items-end gap-4`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-xl transition-transform hover:scale-110 ${
                  message.sender === 'user' 
                    ? 'bg-slate-800/80 border-slate-600 text-slate-300' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400/50 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                }`}>
                  {message.sender === 'user' ? <User className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col gap-2 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-6 shadow-2xl backdrop-blur-xl relative transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.6)] ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-[#1e293b]/90 to-[#0f172a]/90 border border-slate-700/50 text-slate-200 rounded-[2rem] rounded-br-sm' 
                      : 'bg-[#0a1128]/80 border border-blue-900/40 text-slate-200 rounded-[2rem] rounded-bl-sm overflow-hidden'
                  }`}>
                    {/* Subtle highlight for bot */}
                    {message.sender === 'bot' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-600 opacity-70" />
                    )}

                    {message.attachmentName && (
                      <div className="flex items-center gap-3 mb-4 p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl text-sm text-blue-200/80">
                        <Paperclip className="w-4 h-4 flex-shrink-0 text-blue-400" />
                        <span className="truncate max-w-[200px] font-medium">{message.attachmentName}</span>
                      </div>
                    )}
                    {message.sender === 'user' ? (
                      <p className="whitespace-pre-wrap font-medium">{message.text}</p>
                    ) : (
                      <div className="markdown-body prose prose-slate prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-blue-300 prose-a:text-cyan-400 prose-strong:text-blue-100 prose-li:marker:text-blue-500/50 text-[15px] leading-relaxed">
                        <ReactMarkdown
                          components={{
                            a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] ${message.sender === 'user' ? 'text-slate-500 pr-3 flex-row-reverse' : 'text-blue-400/50 pl-3'}`}>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.sender === 'bot' && (
                      <div className="flex gap-2">
                         <button onClick={() => speak(message.text)} className="hover:text-blue-300 flex items-center gap-1.5 transition-colors bg-blue-950/40 px-2 py-1 rounded-md" title="Read Aloud">
                           <PlayCircle className="w-3.5 h-3.5" /> READ
                         </button>
                         {isSpeaking && (
                           <button onClick={stopSpeaking} className="hover:text-red-400 flex items-center gap-1.5 transition-colors bg-red-950/40 px-2 py-1 rounded-md" title="Stop">
                             <StopCircle className="w-3.5 h-3.5" /> STOP
                           </button>
                         )}
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="flex max-w-[85%] md:max-w-[75%] flex-row items-end gap-4 max-w-4xl mx-auto">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400/50 text-white">
                  <Scale className="w-5 h-5" />
                </div>
                <div className="p-6 shadow-2xl bg-[#0a1128]/80 backdrop-blur-xl border border-blue-900/40 rounded-[2rem] rounded-bl-sm flex items-center gap-3 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-600 opacity-70" />
                  <div className="w-2.5 h-2.5 bg-blue-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-blue-500/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Input Area */}
      <div className="px-4 pb-6 pt-10 z-20 bg-gradient-to-t from-[#050a14] via-[#050a14]/90 to-transparent absolute bottom-0 left-0 right-0">
        <div className="max-w-4xl mx-auto w-full relative">
          
          {attachment && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute -top-16 left-8 right-8 flex justify-center z-30 pointer-events-none">
              <div className="bg-[#0a1128]/95 backdrop-blur-xl border border-blue-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] px-5 py-2.5 flex items-center gap-3 text-sm rounded-full text-slate-200 pointer-events-auto">
                <div className="bg-blue-500/20 p-1.5 rounded-full"><Paperclip className="w-4 h-4 text-blue-400" /></div>
                <span className="truncate max-w-[200px] font-semibold">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="text-slate-400 hover:text-red-400 hover:bg-white/5 p-1 rounded-full transition-colors ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-3 bg-[#0a1128]/80 backdrop-blur-2xl border border-blue-900/50 rounded-[2.5rem] p-3 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all duration-300 shadow-[0_15px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            {/* Inner glow effect on focus */}
             <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-500/5 to-cyan-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex gap-1 text-slate-400 pl-2 pb-1 relative z-10">
               <button 
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className="p-3.5 hover:bg-blue-500/10 hover:text-blue-400 rounded-full transition-all hover:scale-110 active:scale-95"
                 title="Attach Document (PDF/Image)"
               >
                 <Paperclip className="w-5 h-5" />
               </button>
               <input 
                 type="file" 
                 accept="application/pdf,image/*" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={handleFileChange}
               />
               <button 
                 type="button"
                 onClick={startListening}
                 className={`p-3.5 rounded-full transition-all hover:scale-110 active:scale-95 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'hover:bg-blue-500/10 hover:text-blue-400'}`}
                 title="Voice Input"
               >
                 <Mic className="w-5 h-5" />
               </button>
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Query the sovereign database..."
              className="w-full max-h-40 min-h-[60px] py-4 px-2 bg-transparent resize-none border-none focus:ring-0 text-slate-100 placeholder-slate-600 font-medium text-lg leading-relaxed scrollbar-thin scrollbar-thumb-blue-900/50 relative z-10"
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
            />

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59, 130, 246, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={(!input.trim() && !attachment) || isLoading}
              className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/50 text-white rounded-full shadow-[0_5px_20px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none mb-1 mr-1 relative z-10"
              aria-label="Send message"
            >
              <Send className="w-6 h-6 ml-1" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userData, setUserData] = useState({ name: '', jurisdiction: '', location: '', language: '' });

  if (!onboardingComplete) {
    return <Onboarding onComplete={(data) => {
      setUserData(data);
      setOnboardingComplete(true);
    }} />
  }

  return <ChatApp userData={userData} />
}
