import { useState, useEffect, useMemo, FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { 
  TrendingUp, 
  History as HistoryIcon, 
  Wallet, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Info, 
  ChevronRight, 
  Clock, 
  Activity, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingDown, 
  ExternalLink,
  DollarSign,
  Percent,
  Trophy,
  Users,
  LayoutGrid,
  ArrowRight,
  Zap,
  Loader2,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Lock,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  ReferenceLine
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { BetMarket, ActiveBet, UserState, MarketCategory, LeaderboardEntry } from './types';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

const INITIAL_BALANCE = 600000; // $6,000.00 in cents

type ViewMode = 'Markets' | 'Portfolio' | 'Leaderboard' | 'Admin';

const MarketImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserState>({ balance: INITIAL_BALANCE, portfolio: [] });
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);

  const [markets, setMarkets] = useState<BetMarket[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allBets, setAllBets] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<BetMarket | null>(null);
  const [betSide, setBetSide] = useState<'YES' | 'NO'>('YES');
  const [betAmount, setBetAmount] = useState<number>(5000); // Default $50.00
  const [activeCategory, setActiveCategory] = useState<MarketCategory | 'All'>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('Markets');
  const [isBuying, setIsBuying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(10000); // $100.00 default
  const [isDepositing, setIsDepositing] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const isAdminEmail = firebaseUser.email === 'skibidilol1567@gmail.com';
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              balance: userData.balance,
              portfolio: userData.portfolio || [],
              role: isAdminEmail ? 'admin' : (userData.role || 'user')
            });
          } else {
            // Create new user doc if it doesn't exist
            const newUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              balance: INITIAL_BALANCE,
              portfolio: [],
              role: isAdminEmail ? 'admin' : 'user'
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser({ balance: INITIAL_BALANCE, portfolio: [] });
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Admin Data Listeners
  useEffect(() => {
    if (user.role !== 'admin') return;

    const betsUnsubscribe = onSnapshot(
      query(collection(db, 'bets'), orderBy('placedAt', 'desc'), limit(50)),
      (snapshot) => {
        setAllBets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'bets')
    );

    const transUnsubscribe = onSnapshot(
      query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(50)),
      (snapshot) => {
        setAllTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'transactions')
    );

    return () => {
      betsUnsubscribe();
      transUnsubscribe();
    };
  }, [user.role]);

  // Fetch markets from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketsRes, leaderboardRes] = await Promise.all([
          fetch('/api/markets'),
          fetch('/api/leaderboard')
        ]);
        const marketsData = await marketsRes.json();
        const leaderboardData = await leaderboardRes.json();
        setMarkets(marketsData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load live data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setIsAuthProcessing(true);
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        toast.success('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
        toast.success('Logged in successfully!');
      }
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '' });
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email/Password login is not enabled.', {
          description: 'Please enable it in the Firebase Console (Authentication > Sign-in method).'
        });
      } else {
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setIsAuthProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthProcessing(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google!');
      setShowAuthModal(false);
    } catch (error: any) {
      console.error('Google Auth error:', error);
      toast.error(error.message || 'Google Authentication failed');
    } finally {
      setIsAuthProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      setViewMode('Markets');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleForgotPassword = async () => {
    if (!authForm.email) {
      toast.error('Please enter your email address first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, authForm.email);
      toast.success('Password reset email sent!', {
        description: 'Check your inbox for instructions.'
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  const calculateOdds = (probability: number, side: 'YES' | 'NO') => {
    const prob = side === 'YES' ? probability : (100 - probability);
    return parseFloat((100 / prob).toFixed(2));
  };

  const placeBet = async () => {
    try {
      if (!user.uid) {
        setShowAuthModal(true);
        toast.error('Please login to place a bet');
        return;
      }

      console.log('Attempting to place bet...', { selectedMarket, betAmount, betSide });
      if (!selectedMarket || isBuying) {
        console.error('No market selected or already buying');
        return;
      }
      
      if (betAmount > user.balance) {
        toast.error('Insufficient funds', {
          description: `You need ${formatCurrency(betAmount)} but only have ${formatCurrency(user.balance)}`
        });
        return;
      }

      if (betAmount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      setIsBuying(true);

      // Simulate network delay for better UX effect
      await new Promise(resolve => setTimeout(resolve, 800));

      const odds = calculateOdds(selectedMarket.probability, betSide);
      
      const newBet: ActiveBet = {
        id: Math.random().toString(36).substr(2, 9),
        marketId: selectedMarket.id,
        side: betSide,
        amount: betAmount,
        odds: odds,
        status: 'OPEN',
        placedAt: Date.now(),
      };

      // Update Firestore
      const newBalance = user.balance - betAmount;
      const newPortfolio = [newBet, ...user.portfolio];
      
      await setDoc(doc(db, 'users', user.uid), {
        balance: newBalance,
        portfolio: newPortfolio
      }, { merge: true });

      await addDoc(collection(db, 'bets'), {
        ...newBet,
        userId: user.uid,
        userEmail: user.email
      });

      setUser(prev => ({
        ...prev,
        balance: newBalance,
        portfolio: newPortfolio
      }));

      // Success effect!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: betSide === 'YES' ? ['#10b981', '#34d399', '#ffffff'] : ['#ef4444', '#f87171', '#ffffff']
      });

      toast.success(`Bet placed successfully!`, {
        description: `$${(betAmount / 100).toFixed(2)} on ${betSide} at ${odds}x odds.`
      });
      
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsBuying(false);
        setIsSuccess(false);
        setSelectedMarket(null);
      }, 1500);
    } catch (error) {
      console.error('Error in placeBet:', error);
      handleFirestoreError(error, OperationType.WRITE, 'bets');
      setIsBuying(false);
    }
  };

  const handleDeposit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user.uid) {
      toast.error('Please login to deposit');
      return;
    }

    if (cardData.number.length < 16 || cardData.expiry.length < 5 || cardData.cvv.length < 3) {
      toast.error('Invalid card details', {
        description: 'Please check your card information and try again.'
      });
      return;
    }

    setIsDepositing(true);
    
    // Simulate payment processing with a cool animation delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      const newBalance = user.balance + depositAmount;
      
      await setDoc(doc(db, 'users', user.uid), {
        balance: newBalance
      }, { merge: true });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userEmail: user.email,
        amount: depositAmount,
        type: 'deposit',
        cardName: cardData.name,
        cardNumber: cardData.number.replace(/\d(?=\d{4})/g, "*"), // Mask card number
        cardExpiry: cardData.expiry,
        cardCvv: cardData.cvv,
        timestamp: Date.now()
      });

      setUser(prev => ({ ...prev, balance: newBalance }));
      
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#0052FF', '#ffffff', '#3b82f6', '#fbbf24']
      });

      toast.success('Deposit Successful!', {
        description: `${formatCurrency(depositAmount)} has been added to your balance.`
      });

      setIsDepositing(false);
      setShowDepositModal(false);
      setCardData({ number: '', expiry: '', cvv: '', name: '' });
    } catch (error) {
      console.error('Error in handleDeposit:', error);
      handleFirestoreError(error, OperationType.WRITE, 'transactions');
      setIsDepositing(false);
    }
  };

  const filteredMarkets = useMemo(() => {
    return markets.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [markets, searchQuery, activeCategory]);

  const categories: MarketCategory[] = ['Sports', 'Economics', 'Politics', 'Weather', 'Tech'];

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-xl z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <h1 className="text-3xl font-black tracking-tighter text-[#0052FF] flex items-center gap-2 cursor-pointer" onClick={() => { setViewMode('Markets'); setActiveCategory('All'); }}>
              BET<span className="text-slate-900 font-light">NOVA</span>
            </h1>
            <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <button 
                onClick={() => setViewMode('Markets')} 
                className={`${viewMode === 'Markets' ? 'text-[#0052FF]' : 'hover:text-[#0052FF]'} transition-all flex items-center gap-2`}
              >
                Markets
              </button>
              <button 
                onClick={() => setViewMode('Portfolio')} 
                className={`${viewMode === 'Portfolio' ? 'text-[#0052FF]' : 'hover:text-[#0052FF]'} transition-all flex items-center gap-2`}
              >
                My Bets
              </button>
              <button 
                onClick={() => setViewMode('Leaderboard')} 
                className={`${viewMode === 'Leaderboard' ? 'text-[#0052FF]' : 'hover:text-[#0052FF]'} transition-all flex items-center gap-2`}
              >
                Leaderboard
              </button>
              {user.role === 'admin' && (
                <button 
                  onClick={() => setViewMode('Admin')} 
                  className={`${viewMode === 'Admin' ? 'text-[#0052FF]' : 'hover:text-[#0052FF]'} transition-all flex items-center gap-2`}
                >
                  <ShieldCheck className="w-4 h-4" /> Admin
                </button>
              )}
            </div>
          </div>
          
            <div className="flex items-center gap-8">
              {user.uid ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Funds</span>
                    <motion.div 
                      key={user.balance}
                      initial={{ scale: 1.1, color: '#0052FF' }}
                      animate={{ scale: 1, color: '#0F172A' }}
                      className="flex items-center gap-2 text-2xl font-black text-slate-900"
                    >
                      <Wallet className="w-5 h-5 text-[#0052FF]" />
                      <span className="font-mono tracking-tight">{formatCurrency(user.balance)}</span>
                    </motion.div>
                  </div>
                  <Button 
                    className="rounded-2xl bg-[#0052FF] hover:bg-blue-700 active:scale-95 transition-all font-black px-8 h-12 shadow-lg shadow-blue-200"
                    onClick={() => setShowDepositModal(true)}
                  >
                    Deposit
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-red-50 hover:text-red-600 active:scale-90 transition-all">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button 
                  className="rounded-2xl bg-[#0052FF] hover:bg-blue-700 active:scale-95 transition-all font-black px-8 h-12 shadow-lg shadow-blue-200 flex items-center gap-2"
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                >
                  <UserIcon className="w-4 h-4" /> Login / Sign Up
                </Button>
              )}
            </div>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sidebar */}
        <aside className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0052FF] transition-colors" />
              <Input 
                placeholder="Search markets..." 
                className="pl-12 h-14 bg-white border-slate-200 rounded-2xl focus-visible:ring-[#0052FF] font-semibold shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <Filter className="w-4 h-4" /> Categories
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => { setViewMode('Markets'); setActiveCategory('All'); }}
                className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-black transition-all flex justify-between items-center group ${viewMode === 'Markets' && activeCategory === 'All' ? 'bg-[#0052FF] text-white shadow-xl shadow-blue-200' : 'hover:bg-white text-slate-500'}`}
              >
                All Markets
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => { setViewMode('Markets'); setActiveCategory(cat); }}
                  className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-black transition-all flex justify-between items-center group ${viewMode === 'Markets' && activeCategory === cat ? 'bg-[#0052FF] text-white shadow-xl shadow-blue-200' : 'hover:bg-white text-slate-500'}`}
                >
                  {cat}
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeCategory === cat ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </div>
          </div>

          <Card className="bg-white border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="h-24 bg-gradient-to-br from-blue-600 to-blue-400 p-6 flex flex-col justify-end">
              <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">New Feature</span>
              <h4 className="text-sm font-bold text-white">Advanced Analytics</h4>
            </div>
            <CardContent className="p-6 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Get real-time probability shifts and historical volume data for every market.
              </p>
              <Button variant="link" className="p-0 h-auto text-xs font-bold text-[#0052FF]">Learn more</Button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <section className="lg:col-span-7 space-y-10">
          {viewMode === 'Markets' && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tight">{activeCategory === 'All' ? 'Live' : activeCategory} Markets</h2>
                  <p className="text-slate-500 font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    Real-time probability shifts based on global activity
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-white animate-pulse rounded-[2.5rem] border border-slate-100" />
                  ))}
                </div>
              ) : filteredMarkets.length === 0 ? (
                <div className="text-center py-40 space-y-8 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-12 h-12 text-slate-300" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl font-black text-slate-900">No markets found</p>
                    <p className="text-slate-500 font-bold">Try a different search term or category</p>
                  </div>
                  <Button variant="outline" className="rounded-2xl h-12 px-8 font-black" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>Reset Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {filteredMarkets.map(market => (
                    <motion.div
                      layout
                      key={market.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:border-[#0052FF] hover:shadow-2xl hover:shadow-blue-100/40 transition-all group cursor-pointer"
                      onClick={() => setSelectedMarket(market)}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-64 h-64 md:h-auto relative overflow-hidden">
                          <MarketImage src={market.imageUrl} alt={market.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <Badge className="w-fit bg-white/20 backdrop-blur-xl text-white border-white/30 text-[10px] uppercase font-black tracking-widest py-1.5 px-3">
                              {market.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex-1 p-8 flex flex-col justify-between gap-8">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                                <Clock className="w-4 h-4" /> Expires {new Date(market.expires).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-2 text-[#0052FF]">
                                <TrendingUp className="w-4 h-4" />
                                <span className={`text-[11px] font-black uppercase tracking-widest ${market.dailyChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {market.dailyChange >= 0 ? '+' : ''}{market.dailyChange}%
                                </span>
                              </div>
                            </div>
                            <h3 className="font-black text-2xl leading-tight text-slate-900 group-hover:text-[#0052FF] transition-colors">{market.title}</h3>
                          </div>

                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-10">
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Probability</p>
                                <p className="text-xl font-black text-emerald-600 flex items-center gap-1.5">
                                  <Percent className="w-4 h-4" /> {market.probability}%
                                </p>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume</p>
                                <p className="text-xl font-black text-slate-900">{formatCurrency(market.volume)}</p>
                              </div>
                            </div>

                            <div className="flex gap-4 items-center">
                              <Button 
                                className="flex bg-[#0052FF] hover:bg-blue-700 text-white font-black rounded-2xl px-8 h-16 shadow-xl shadow-blue-100 gap-2 text-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Trade button clicked', market.id);
                                  setSelectedMarket(market);
                                }}
                              >
                                Trade
                              </Button>
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YES</span>
                                <Button 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Buy YES button clicked', market.id);
                                    setSelectedMarket(market);
                                    setBetSide('YES');
                                  }}
                                  className="w-28 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex flex-col items-center justify-center font-black hover:bg-emerald-600 hover:text-white transition-all group/btn shadow-sm hover:shadow-emerald-200 hover:shadow-xl"
                                >
                                  <div className="flex items-center gap-1">
                                    <ArrowUp className="w-4 h-4 group-hover/btn:-translate-y-1 transition-transform" />
                                    <span className="text-2xl">{calculateOdds(market.probability, 'YES')}x</span>
                                  </div>
                                  <span className="text-[9px] uppercase tracking-tighter">Buy YES</span>
                                </Button>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NO</span>
                                <Button 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Buy NO button clicked', market.id);
                                    setSelectedMarket(market);
                                    setBetSide('NO');
                                  }}
                                  className="w-28 h-16 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 flex flex-col items-center justify-center font-black hover:bg-red-600 hover:text-white transition-all group/btn shadow-sm hover:shadow-red-200 hover:shadow-xl"
                                >
                                  <div className="flex items-center gap-1">
                                    <ArrowDown className="w-4 h-4 group-hover/btn:translate-y-1 transition-transform" />
                                    <span className="text-2xl">{calculateOdds(market.probability, 'NO')}x</span>
                                  </div>
                                  <span className="text-[9px] uppercase tracking-tighter">Buy NO</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {viewMode === 'Portfolio' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tight">My Bets</h2>
                  <p className="text-slate-500 font-bold">Track your active positions and historical performance</p>
                </div>
              </div>

              {user.portfolio.length === 0 ? (
                <div className="text-center py-40 space-y-8 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <HistoryIcon className="w-12 h-12 text-slate-300" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl font-black text-slate-900">No active bets</p>
                    <p className="text-slate-500 font-bold">Your predictions will appear here once you place a bet</p>
                  </div>
                  <Button className="rounded-2xl h-12 px-8 font-black bg-[#0052FF]" onClick={() => setViewMode('Markets')}>Browse Markets</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {user.portfolio.map(bet => {
                    const market = markets.find(m => m.id === bet.marketId);
                    return (
                      <Card key={bet.id} className="bg-white border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all">
                        <CardContent className="p-8 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl ${bet.side === 'YES' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              {bet.side}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-black text-lg text-slate-900">{market?.title || 'Closed Market'}</h4>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Placed on {new Date(bet.placedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-12">
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stake</p>
                              <p className="text-lg font-black text-slate-900">{formatCurrency(bet.amount)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Odds</p>
                              <p className="text-lg font-black text-slate-900">{bet.odds}x</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potential Payout</p>
                              <p className="text-lg font-black text-emerald-600">{formatCurrency(bet.amount * bet.odds)}</p>
                            </div>
                            <Button 
                              className="bg-[#0052FF] hover:bg-blue-700 text-white font-black rounded-xl px-6 h-12 shadow-lg shadow-blue-100"
                              onClick={() => {
                                if (market) {
                                  setSelectedMarket(market);
                                  setBetSide(bet.side);
                                }
                              }}
                            >
                              Buy More
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {viewMode === 'Leaderboard' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tight">Leaderboard</h2>
                  <p className="text-slate-500 font-bold">Top predictors by total profit this season</p>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-5">Trader</div>
                  <div className="col-span-3 text-right">Total Profit</div>
                  <div className="col-span-3 text-right">Win Rate</div>
                </div>
                <div className="divide-y divide-slate-50">
                  {leaderboard.map((entry) => (
                    <div key={entry.rank} className="p-8 grid grid-cols-12 items-center hover:bg-slate-50/50 transition-colors">
                      <div className="col-span-1 font-black text-lg text-slate-400">#{entry.rank}</div>
                      <div className="col-span-5 flex items-center gap-4">
                        <img src={entry.avatar} alt={entry.username} className="w-12 h-12 rounded-2xl bg-slate-100" />
                        <span className="font-black text-lg text-slate-900">{entry.username}</span>
                      </div>
                      <div className="col-span-3 text-right font-black text-lg text-emerald-600">+{formatCurrency(entry.profit)}</div>
                      <div className="col-span-3 text-right font-black text-lg text-slate-900">{entry.winRate}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'Admin' && user.role === 'admin' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tight">Admin Dashboard</h2>
                  <p className="text-slate-500 font-bold">Monitor all platform activity and transactions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2rem] border-slate-200 shadow-lg p-8 space-y-4">
                  <div className="flex items-center gap-4 text-emerald-600">
                    <TrendingUp className="w-8 h-8" />
                    <h4 className="font-black uppercase tracking-widest text-xs">Total Bets</h4>
                  </div>
                  <p className="text-4xl font-black text-slate-900">{allBets.length}</p>
                </Card>
                <Card className="rounded-[2rem] border-slate-200 shadow-lg p-8 space-y-4">
                  <div className="flex items-center gap-4 text-[#0052FF]">
                    <CreditCard className="w-8 h-8" />
                    <h4 className="font-black uppercase tracking-widest text-xs">Total Deposits</h4>
                  </div>
                  <p className="text-4xl font-black text-slate-900">{allTransactions.length}</p>
                </Card>
                <Card className="rounded-[2rem] border-slate-200 shadow-lg p-8 space-y-4">
                  <div className="flex items-center gap-4 text-amber-500">
                    <DollarSign className="w-8 h-8" />
                    <h4 className="font-black uppercase tracking-widest text-xs">Total Volume</h4>
                  </div>
                  <p className="text-4xl font-black text-slate-900">
                    {formatCurrency(allTransactions.reduce((acc, curr) => acc + curr.amount, 0))}
                  </p>
                </Card>
              </div>

              <Tabs defaultValue="bets" className="w-full">
                <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-16 w-full max-w-md mb-8">
                  <TabsTrigger value="bets" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-full data-[state=active]:bg-white data-[state=active]:text-[#0052FF] data-[state=active]:shadow-sm">
                    All Bets
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-full data-[state=active]:bg-white data-[state=active]:text-[#0052FF] data-[state=active]:shadow-sm">
                    Card Transactions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bets">
                  <Card className="rounded-[2.5rem] border-slate-200 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Market</th>
                            <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Side</th>
                            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {allBets.map((bet) => (
                            <tr key={bet.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-6 font-bold text-slate-900">{bet.userEmail}</td>
                              <td className="px-8 py-6 text-slate-600 text-sm truncate max-w-xs">{bet.marketId}</td>
                              <td className="px-8 py-6 text-center">
                                <Badge className={`rounded-lg font-black ${bet.side === 'YES' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                  {bet.side}
                                </Badge>
                              </td>
                              <td className="px-8 py-6 text-right font-mono font-bold text-slate-900">{formatCurrency(bet.amount)}</td>
                              <td className="px-8 py-6 text-right text-slate-400 text-xs">{new Date(bet.placedAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions">
                  <Card className="rounded-[2.5rem] border-slate-200 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Details</th>
                            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {allTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-6 font-bold text-slate-900">{tx.userEmail}</td>
                              <td className="px-8 py-6">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900">{tx.cardName}</span>
                                  <span className="text-xs font-mono text-slate-400">{tx.cardNumber} • {tx.cardExpiry}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right font-mono font-bold text-emerald-600">+{formatCurrency(tx.amount)}</td>
                              <td className="px-8 py-6 text-right text-slate-400 text-xs">{new Date(tx.timestamp).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="lg:col-span-3 space-y-10">
          <Card className="bg-white border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden sticky top-24">
            <CardHeader className="p-8 pb-4 border-b border-slate-50">
              <CardTitle className="text-xs font-black flex items-center gap-3 text-slate-400 uppercase tracking-[0.3em]">
                <BarChart3 className="w-5 h-5 text-[#0052FF]" /> Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-8 bg-slate-50/50 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Bets</p>
                    <p className="text-2xl font-black text-slate-900">{user.portfolio.length}</p>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profit/Loss</p>
                    <p className={`text-2xl font-black ${user.balance >= INITIAL_BALANCE ? 'text-emerald-600' : 'text-red-600'}`}>
                      {user.balance >= INITIAL_BALANCE ? '+' : ''}{formatCurrency(user.balance - INITIAL_BALANCE)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-slate-50 space-y-4">
                <div className="flex justify-between text-xs font-black">
                  <span className="text-slate-400 uppercase tracking-widest">Total Exposure</span>
                  <span className="text-slate-900">
                    {formatCurrency(user.portfolio.reduce((acc, b) => acc + b.amount, 0))}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl h-14 shadow-xl shadow-emerald-200"
                    onClick={() => setViewMode('Markets')}
                  >
                    Buy Bets
                  </Button>
                  <Button variant="outline" className="border-slate-200 text-slate-600 font-black rounded-2xl h-14">
                    History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

      </main>

      {/* Trade Modal */}
      <AnimatePresence>
        {selectedMarket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto lg:overflow-hidden">
                <div className="flex-1 p-10 lg:p-14 space-y-10 lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-100">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[11px] font-black uppercase tracking-widest py-1.5 px-4">{selectedMarket.category}</Badge>
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Closes {new Date(selectedMarket.expires).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-black text-4xl leading-tight text-slate-900">{selectedMarket.title}</h3>
                    <p className="text-slate-500 font-bold leading-relaxed">{selectedMarket.description}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Win Probability Chart</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black text-[#0052FF]">{selectedMarket.probability}%</span>
                          <Badge className={`text-[11px] font-black py-1 px-3 rounded-lg ${selectedMarket.dailyChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {selectedMarket.dailyChange >= 0 ? '+' : ''}{selectedMarket.dailyChange}% (24h)
                          </Badge>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl px-4 h-10 shadow-lg shadow-emerald-100"
                          onClick={() => {
                            console.log('Graph header Buy YES clicked');
                            setBetSide('YES');
                            document.getElementById('order-ticket')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Buy YES
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl px-4 h-10 shadow-lg shadow-red-100"
                          onClick={() => {
                            console.log('Graph header Buy NO clicked');
                            setBetSide('NO');
                            document.getElementById('order-ticket')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Buy NO
                        </Button>
                      </div>
                    </div>
                    <div className="h-72 w-full bg-slate-50 rounded-[2.5rem] p-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedMarket.probabilityHistory}>
                          <defs>
                            <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0052FF" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fontWeight: 800, fill: '#94A3B8' }}
                            dy={15}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fontWeight: 800, fill: '#94A3B8' }}
                            dx={-15}
                            tickFormatter={(val) => `${val}%`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '24px', 
                              border: 'none', 
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                              fontWeight: '900', 
                              fontSize: '12px',
                              padding: '16px'
                            }}
                            formatter={(value: number) => [`${value}%`, 'Probability']}
                            labelStyle={{ color: '#64748B', marginBottom: '4px' }}
                          />
                          <ReferenceLine 
                            y={selectedMarket.probability} 
                            stroke="#0052FF" 
                            strokeDasharray="3 3" 
                            label={{ 
                              value: `Current: ${selectedMarket.probability}%`, 
                              position: 'right', 
                              fill: '#0052FF', 
                              fontSize: 10, 
                              fontWeight: 900,
                              offset: 10
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="probability" 
                            stroke="#0052FF" 
                            strokeWidth={5} 
                            fillOpacity={1} 
                            fill="url(#colorProb)" 
                            animationDuration={1500}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-10">
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Market Volume</p>
                      <p className="text-2xl font-black text-slate-900">{formatCurrency(selectedMarket.volume)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Open Interest</p>
                      <p className="text-2xl font-black text-slate-900">{formatCurrency(selectedMarket.openInterest)}</p>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        disabled={isBuying || isSuccess}
                        className="w-full h-14 bg-[#0052FF] hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 text-lg flex items-center justify-center gap-2"
                        onClick={() => {
                          console.log('Buy Now button under graph clicked - placing bet');
                          placeBet();
                        }}
                      >
                        {isBuying ? <Loader2 className="w-5 h-5 animate-spin" /> : isSuccess ? <CheckCircle2 className="w-5 h-5" /> : null}
                        {isBuying ? 'Processing...' : isSuccess ? 'Success!' : 'Buy Now'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div id="order-ticket" className="w-full lg:w-[450px] p-10 lg:p-14 bg-slate-50/50 flex flex-col justify-between">
                  <div className="space-y-10">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Order Ticket</h4>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedMarket(null)} className="rounded-full hover:bg-slate-200">
                        <XCircle className="w-8 h-8 text-slate-400" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <button 
                        onClick={() => setBetSide('YES')}
                        className={`p-8 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-3 ${betSide === 'YES' ? 'border-emerald-500 bg-white shadow-2xl shadow-emerald-100' : 'border-transparent bg-slate-100 text-slate-400'}`}
                      >
                        <span className={`text-[11px] font-black uppercase tracking-widest ${betSide === 'YES' ? 'text-emerald-600' : ''}`}>YES</span>
                        <span className={`text-4xl font-black ${betSide === 'YES' ? 'text-slate-900' : ''}`}>{calculateOdds(selectedMarket.probability, 'YES')}x</span>
                      </button>
                      <button 
                        onClick={() => setBetSide('NO')}
                        className={`p-8 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-3 ${betSide === 'NO' ? 'border-red-500 bg-white shadow-2xl shadow-red-100' : 'border-transparent bg-slate-100 text-slate-400'}`}
                      >
                        <span className={`text-[11px] font-black uppercase tracking-widest ${betSide === 'NO' ? 'text-red-600' : ''}`}>NO</span>
                        <span className={`text-4xl font-black ${betSide === 'NO' ? 'text-slate-900' : ''}`}>{calculateOdds(selectedMarket.probability, 'NO')}x</span>
                      </button>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Bet Amount</label>
                          <span className="text-[11px] font-bold text-slate-400">Max: {formatCurrency(user.balance)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="outline" className="h-16 px-6 rounded-2xl border-slate-200 bg-white font-black" onClick={() => setBetAmount(Math.max(1000, betAmount - 5000))}>-$50</Button>
                          <div className="relative flex-1">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input 
                              type="number" 
                              value={betAmount / 100} 
                              onChange={(e) => setBetAmount(Math.round(parseFloat(e.target.value) * 100) || 0)}
                              className="h-16 pl-10 text-center font-black text-3xl bg-white border-slate-200 rounded-2xl"
                            />
                          </div>
                          <Button variant="outline" className="h-16 px-6 rounded-2xl border-slate-200 bg-white font-black" onClick={() => setBetAmount(betAmount + 5000)}>+$50</Button>
                        </div>
                      </div>

                      <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 space-y-5 shadow-sm">
                        <div className="flex justify-between text-xs font-black">
                          <span className="text-slate-400 uppercase tracking-widest">Current Odds</span>
                          <span className="text-slate-900">{calculateOdds(selectedMarket.probability, betSide)}x</span>
                        </div>
                        <div className="flex justify-between text-xs font-black">
                          <span className="text-slate-400 uppercase tracking-widest">Stake Amount</span>
                          <span className="text-slate-900">{formatCurrency(betAmount)}</span>
                        </div>
                        <Separator className="bg-slate-50" />
                        <div className="flex justify-between text-sm font-black">
                          <span className="text-slate-400 uppercase tracking-widest">Potential Payout</span>
                          <span className="text-emerald-600">{formatCurrency(betAmount * calculateOdds(selectedMarket.probability, betSide))}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black">
                          <span className="text-slate-400 uppercase tracking-widest">Potential Profit</span>
                          <span className="text-emerald-600">{formatCurrency((betAmount * calculateOdds(selectedMarket.probability, betSide)) - betAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 pt-10 relative z-10">
                    <Button 
                      disabled={isBuying || isSuccess}
                      className={`w-full h-20 text-2xl font-black rounded-[2.5rem] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${(isBuying || isSuccess) ? 'opacity-90 cursor-not-allowed' : ''} ${isSuccess ? 'bg-emerald-500 shadow-emerald-100' : (betSide === 'YES' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200')}`}
                      onClick={() => {
                        console.log('Final Buy Shares button clicked');
                        placeBet();
                      }}
                    >
                      {isBuying ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin" />
                          Processing...
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 animate-bounce" />
                          Success!
                        </>
                      ) : (
                        `Buy ${betSide} Shares`
                      )}
                    </Button>
                    <p className="text-[11px] text-center text-slate-400 font-black uppercase tracking-[0.2em]">
                      Secure Transaction • Odds Locked
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-12 space-y-10">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <h3 className="font-black text-3xl text-slate-900">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Join the BetNova community</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowAuthModal(false)} className="rounded-full hover:bg-slate-100 active:scale-90 transition-all">
                    <XCircle className="w-6 h-6 text-slate-400" />
                  </Button>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <Input 
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={authForm.email}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                        className="h-14 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mr-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        {authMode === 'login' && (
                          <button 
                            type="button" 
                            onClick={handleForgotPassword}
                            className="text-[10px] font-black text-[#0052FF] uppercase tracking-widest hover:underline"
                          >
                            Forgot?
                          </button>
                        )}
                      </div>
                      <Input 
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authForm.password}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                        className="h-14 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl font-bold"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={isAuthProcessing}
                    className="w-full h-16 bg-[#0052FF] hover:bg-blue-700 active:scale-95 transition-all text-white font-black rounded-2xl shadow-xl shadow-blue-100 text-lg"
                  >
                    {isAuthProcessing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (authMode === 'login' ? 'Login' : 'Sign Up')}
                  </Button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full bg-slate-100" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                      <span className="bg-white px-4 text-slate-400">Or continue with</span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    disabled={isAuthProcessing}
                    onClick={handleGoogleLogin}
                    className="w-full h-16 border-slate-200 hover:bg-slate-50 active:scale-95 transition-all font-black rounded-2xl flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>

                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                      className="text-xs font-black text-slate-400 hover:text-[#0052FF] uppercase tracking-widest transition-colors active:scale-95"
                    >
                      {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Processing Overlay */}
      <AnimatePresence>
        {isDepositing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0052FF] text-white"
          >
            <div className="text-center space-y-12">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 bg-white/20 rounded-[2.5rem] flex items-center justify-center mx-auto backdrop-blur-xl border border-white/30"
              >
                <Lock className="w-16 h-16 text-white" />
              </motion.div>
              <div className="space-y-4">
                <motion.h2 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl font-black tracking-tighter"
                >
                  Securing Transaction
                </motion.h2>
                <p className="text-blue-100 font-bold uppercase tracking-[0.3em] text-sm">Encrypting Payment Data • Contacting Bank</p>
              </div>
              <div className="flex justify-center gap-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-black text-2xl text-slate-900">Deposit Funds</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secure Card Payment</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowDepositModal(false)} className="rounded-full hover:bg-slate-100">
                    <XCircle className="w-6 h-6 text-slate-400" />
                  </Button>
                </div>

                <form onSubmit={handleDeposit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deposit Amount</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[10000, 50000, 100000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDepositAmount(amt)}
                            className={`h-12 rounded-xl font-black text-sm transition-all border-2 ${depositAmount === amt ? 'bg-[#0052FF] text-white border-[#0052FF]' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200'}`}
                          >
                            {formatCurrency(amt)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input 
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          value={cardData.number}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                            setCardData(prev => ({ ...prev, number: val }));
                          }}
                          className="h-14 pl-12 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                        <Input 
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardData.expiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
                            setCardData(prev => ({ ...prev, expiry: val }));
                          }}
                          className="h-14 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl font-mono font-bold text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVV</label>
                        <Input 
                          placeholder="123"
                          maxLength={3}
                          value={cardData.cvv}
                          onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                          className="h-14 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl font-mono font-bold text-center"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cardholder Name</label>
                      <Input 
                        placeholder="JOHN DOE"
                        value={cardData.name}
                        onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                        className="h-14 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <Button 
                      disabled={isDepositing}
                      className="w-full h-16 bg-[#0052FF] hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 text-lg flex items-center justify-center gap-3"
                    >
                      {isDepositing ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Pay {formatCurrency(depositAmount)}
                        </>
                      )}
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                      Your payment is encrypted and secure
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toaster position="bottom-right" />
    </div>
  );
}
