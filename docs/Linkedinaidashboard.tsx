import React, { useState } from 'react';
import {
    Calendar,
    Settings,
    BarChart3,
    MessageSquare,
    AlertCircle,
    CheckCircle,
    Clock,
    Plus,
    Menu,
    X,
    LogOut,
    ChevronDown,
    RefreshCw,
    Edit,
    Trash2,
    Eye,
    PlayCircle,
    Link as LinkIcon,
} from 'lucide-react';

// Types
interface Account {
    id: string;
    name: string;
    type: 'person' | 'organization';
    avatar?: string;
}

interface Post {
    id: string;
    accountId: string;
    text: string;
    imageUrl: string;
    scheduledTime: string;
    status: 'scheduled' | 'posted' | 'failed' | 'cancelled';
    metrics?: {
        impressions: number;
        reactions: number;
        comments: number;
        clicks: number;
    };
}

interface BrandProfile {
    accountId: string;
    voice: string;
    tone: string;
    pillars: string[];
    hashtags: string[];
}

// App Component
export default function LinkedInAIDashboard() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedAccount, setSelectedAccount] = useState('account_1');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    // Mock data
    const [accounts] = useState<Account[]>([
        { id: 'account_1', name: 'John Doe', type: 'person' },
        { id: 'account_2', name: 'Tech Innovations', type: 'organization' },
        { id: 'account_3', name: 'Growth Hub', type: 'organization' },
    ]);

    const [posts, setPosts] = useState<Post[]>([
        {
            id: 'post_1',
            accountId: 'account_1',
            text: 'Just launched our new AI feature! Excited to share how this changes everything...',
            imageUrl: 'https://images.unsplash.com/photo-1677442d019cecf8d69d0a0f3e4d5e3e?w=600&h=400',
            scheduledTime: '2024-01-15 09:00',
            status: 'posted',
            metrics: { impressions: 1234, reactions: 89, comments: 12, clicks: 45 },
        },
        {
            id: 'post_2',
            accountId: 'account_1',
            text: 'The future of automation is here. Let\'s dive deep into 5 AI trends...',
            imageUrl: 'https://images.unsplash.com/photo-1620712014215-c8dee75446fc?w=600&h=400',
            scheduledTime: '2024-01-16 14:00',
            status: 'scheduled',
        },
        {
            id: 'post_3',
            accountId: 'account_2',
            text: 'Proud to announce our latest partnership! Together, we\'re building...',
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400',
            scheduledTime: '2024-01-17 10:30',
            status: 'scheduled',
        },
    ]);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Calendar },
        { id: 'accounts', label: 'Accounts', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ];

    const bgClass = darkMode ? 'dark bg-slate-900' : 'bg-white';
    const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
    const secondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
    const cardClass = darkMode
        ? 'bg-slate-800 border-slate-700'
        : 'bg-slate-50 border-slate-200';

    return (
        <div className= {`${bgClass} min-h-screen ${textClass}`
}>
    {/* Header */ }
    < header className = {`border-b ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} sticky top-0 z-40`}>
        <div className="flex items-center justify-between px-6 py-4" >
            <div className="flex items-center gap-4" >
                <button
              onClick={ () => setSidebarOpen(!sidebarOpen) }
className = {`p-2 rounded-lg hover:${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
            >
    { sidebarOpen?<X size = { 20 } /> : <Menu size={ 20 } />}
</button>
    < h1 className = "text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent" >
        LinkedInAI
        </h1>
        </div>

        < div className = "flex items-center gap-4" >
            {/* Account Selector */ }
            < div className = "relative" >
                <button className={ `flex items-center gap-2 px-4 py-2 rounded-lg border ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}` }>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
                        <span className="text-sm font-medium" > { accounts.find((a) => a.id === selectedAccount)?.name } </span>
                            < ChevronDown size = { 16} />
                                </button>
                                </div>

{/* Theme Toggle */ }
<button
              onClick={ () => setDarkMode(!darkMode) }
className = {`p-2 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
            >
    { darkMode? '☀️': '🌙' }
    </button>

{/* Logout */ }
<button className={ `flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:${darkMode ? 'bg-slate-700' : 'bg-slate-100'}` }>
    <LogOut size={ 16 } />
        < span className = "text-sm" > Logout </span>
            </button>
            </div>
            </div>
            </header>

            < div className = "flex" >
                {/* Sidebar */ }
{
    sidebarOpen && (
        <aside className={ `w-64 border-r ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'} p-6` }>
            <nav className="space-y-2" >
            {
                navItems.map(({ id, label, icon: Icon }) => (
                    <button
                  key= { id }
                  onClick = {() => setCurrentPage(id)}
    className = {`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${currentPage === id
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
            : darkMode
                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
        }`
}
                >
    <Icon size={ 20 } />
        < span > { label } </span>
        </button>
              ))}
</nav>
    </aside>
        )}

{/* Main Content */ }
<main className="flex-1 p-8" >
    { currentPage === 'dashboard' && (
        <DashboardPage posts={ posts } setPosts = { setPosts } accounts = { accounts } selectedAccount = { selectedAccount } darkMode = { darkMode } cardClass = { cardClass } secondaryClass = { secondaryClass } textClass = { textClass } showGenerateModal = { showGenerateModal } setShowGenerateModal = { setShowGenerateModal } />
          )}
{
    currentPage === 'accounts' && (
        <AccountsPage accounts={ accounts } darkMode = { darkMode } cardClass = { cardClass } secondaryClass = { secondaryClass } />
          )
}
{
    currentPage === 'settings' && (
        <SettingsPage darkMode={ darkMode } cardClass = { cardClass } secondaryClass = { secondaryClass } textClass = { textClass } />
          )
}
{
    currentPage === 'analytics' && (
        <AnalyticsPage posts={ posts } darkMode = { darkMode } cardClass = { cardClass } secondaryClass = { secondaryClass } textClass = { textClass } />
          )
}
</main>
    </div>
    </div>
  );
}

// Dashboard Page Component
function DashboardPage({ posts, setPosts, accounts, selectedAccount, darkMode, cardClass, secondaryClass, textClass, showGenerateModal, setShowGenerateModal }) {
    const accountPosts = posts.filter((p) => p.accountId === selectedAccount);
    const scheduledCount = accountPosts.filter((p) => p.status === 'scheduled').length;
    const postedCount = accountPosts.filter((p) => p.status === 'posted').length;
    const avgEngagement = accountPosts.length > 0
        ? Math.round(
            accountPosts.reduce((sum, p) => sum + ((p.metrics?.reactions || 0) / (p.metrics?.impressions || 1)), 0) / accountPosts.length * 100
        )
        : 0;

    return (
        <div className= "space-y-8" >
        {/* Header */ }
        < div className = "flex justify-between items-center" >
            <div>
            <h2 className="text-3xl font-bold" > Dashboard </h2>
                < p className = {`${secondaryClass} mt-1`
}> 7 - day post pipeline for { accounts.find((a) => a.id === selectedAccount)?.name } </p>
    </div>
    < button
          onClick = {() => setShowGenerateModal(true)}
className = "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
    >
    <RefreshCw size={ 18 } />
          Generate Posts
    </button>
    </div>

{/* KPI Cards */ }
<div className="grid grid-cols-1 md:grid-cols-4 gap-4" >
    <KPICard title="Scheduled" value = { scheduledCount } icon = { Clock } darkMode = { darkMode } />
        <KPICard title="Posted This Week" value = { postedCount } icon = { CheckCircle } darkMode = { darkMode } />
            <KPICard title="Avg Engagement" value = {`${avgEngagement}%`} icon = { BarChart3 } darkMode = { darkMode } />
                <KPICard title="Next Generation" value = "Mon, Jan 22" icon = { Calendar } darkMode = { darkMode } />
                    </div>

{/* Calendar View */ }
<div className={ `border rounded-xl p-6 ${cardClass}` }>
    <h3 className="text-lg font-bold mb-6" > 7 - Day Pipeline </h3>
        < div className = "grid grid-cols-7 gap-3" >
        {
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key= { day } className = {`border rounded-lg p-4 ${darkMode ? 'border-slate-700' : 'border-slate-300'}`} >
            <div className="text-xs font-semibold uppercase mb-3" > { day } </div>
                < div className = "space-y-2" >
                {
                    accountPosts
                  .filter((post) => {
                        const postDate = new Date(post.scheduledTime).getDay();
                        return (idx === 0 && postDate === 1) ||
                            (idx === 1 && postDate === 2) ||
                            (idx === 2 && postDate === 3) ||
                            (idx === 3 && postDate === 4) ||
                            (idx === 4 && postDate === 5) ||
                            (idx === 5 && postDate === 6) ||
                            (idx === 6 && postDate === 0);
                    })
                        .map((post) => (
                            <div
                      key= { post.id }
                      className = {`p-2 rounded text-xs cursor-pointer transition-colors ${post.status === 'posted'
                                    ? 'bg-green-100 text-green-700'
                                    : post.status === 'scheduled'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                    >
                    { post.text.substring(0, 30) }...
</div>
                  ))}
</div>
    </div>
          ))}
</div>
    </div>

{/* Posts List */ }
<div className={ `border rounded-xl p-6 ${cardClass}` }>
    <h3 className="text-lg font-bold mb-6" > Scheduled Posts </h3>
        < div className = "space-y-4" >
        {
            accountPosts.length === 0 ? (
                <div className= {`text-center py-12 ${secondaryClass}`} >
            <MessageSquare size={ 48 } className = "mx-auto mb-4 opacity-50" />
                <p>No posts scheduled.Generate posts to get started.</p>
                    </div>
          ) : (
    accountPosts.map((post) => <PostCard key={ post.id } post = { post } darkMode = { darkMode } cardClass = { cardClass } />)
)}
</div>
    </div>

{/* Generate Modal */ }
{
    showGenerateModal && (
        <GenerateModal onClose={ () => setShowGenerateModal(false) } darkMode = { darkMode } cardClass = { cardClass } />
      )
}
</div>
  );
}

// KPI Card Component
function KPICard({ title, value, icon: Icon, darkMode }) {
    return (
        <div className= {`border rounded-lg p-6 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`
}>
    <div className="flex items-start justify-between" >
        <div>
        <p className={ `text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'} mb-2` }> { title } </p>
            < p className = "text-3xl font-bold" > { value } </p>
                </div>
                < div className = "p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 bg-opacity-20" >
                    <Icon className="text-blue-600" size = { 24} />
                        </div>
                        </div>
                        </div>
  );
}

// Post Card Component
function PostCard({ post, darkMode, cardClass }) {
    return (
        <div className= {`border rounded-lg p-4 ${darkMode ? 'border-slate-700 bg-slate-700 hover:bg-slate-600' : 'border-slate-300 bg-white hover:bg-slate-100'} transition-colors cursor-pointer group`
}>
    <div className="flex gap-4" >
        <img src={ post.imageUrl } alt = "Post" className = "w-24 h-24 rounded object-cover" />
            <div className="flex-1" >
                <div className="flex justify-between items-start mb-2" >
                    <p className="text-sm line-clamp-2" > { post.text } </p>
                        < span className = {`px-2 py-1 rounded text-xs font-semibold ${post.status === 'posted'
                                ? 'bg-green-100 text-green-700'
                                : post.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                { post.status }
                                </span>
                                </div>
                                < p className = {`text-xs mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    { new Date(post.scheduledTime).toLocaleString() }
                                    </p>
{
    post.metrics && (
        <div className="flex gap-4 text-xs" >
            <div className="flex items-center gap-1" >
                <Eye size={ 14 } />
    { post.metrics.impressions }
    </div>
        < div className = "flex items-center gap-1" >
            <MessageSquare size={ 14 } />
    { post.metrics.reactions }
    </div>
        </div>
          )
}
<div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" >
    <button className="p-1 hover:bg-blue-100 rounded text-blue-600 text-xs" >
        <Eye size={ 14 } />
            </button>
            < button className = "p-1 hover:bg-yellow-100 rounded text-yellow-600 text-xs" >
                <Edit size={ 14 } />
                    </button>
                    < button className = "p-1 hover:bg-red-100 rounded text-red-600 text-xs" >
                        <Trash2 size={ 14 } />
                            </button>
                            </div>
                            </div>
                            </div>
                            </div>
  );
}

// Generate Modal Component
function GenerateModal({ onClose, darkMode, cardClass }) {
    const [isGenerating, setIsGenerating] = useState(false);

    return (
        <div className= "fixed inset-0 bg-black/50 flex items-center justify-center z-50" >
        <div className={ `rounded-xl p-8 w-full max-w-md ${cardClass}` }>
            <h3 className="text-xl font-bold mb-4" > Generate 7 - Day Pipeline </h3>
                < p className = {`${darkMode ? 'text-slate-400' : 'text-slate-600'} mb-6 text-sm`
}>
    This will generate 7 high - quality posts based on your brand profile and content pillars.
        </p>

{
    isGenerating ? (
        <div className= "flex flex-col items-center justify-center py-8" >
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
            <p className="text-sm font-medium" > Generating posts...</p>
                < p className = {`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-2`
}>
    Using Social Media Manager, Content Writer, and Graphic Designer agents
        </p>
        </div>
        ) : (
    <div className= "space-y-4" >
    <button
              onClick={ () => setIsGenerating(true) }
className = "w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
    >
    Generate Now
        </button>
        < button
onClick = { onClose }
className = {`w-full py-3 border rounded-lg font-medium ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}
            >
    Cancel
    </button>
    </div>
        )}
</div>
    </div>
  );
}

// Accounts Page Component
function AccountsPage({ accounts, darkMode, cardClass, secondaryClass }) {
    return (
        <div className= "space-y-8" >
        <div className="flex justify-between items-center" >
            <div>
            <h2 className="text-3xl font-bold" > Accounts </h2>
                < p className = {`${secondaryClass} mt-1`
}> Manage your connected LinkedIn accounts </p>
    </div>
    < button className = "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow" >
        <Plus size={ 18 } />
          Connect Account
    </button>
    </div>

    < div className = "grid grid-cols-1 md:grid-cols-3 gap-6" >
    {
        accounts.map((account) => (
            <div key= { account.id } className = {`border rounded-xl p-6 ${cardClass}`} >
        <div className="flex items-center gap-4 mb-4" >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
                <div>
                <p className="font-bold" > { account.name } </p>
                    < p className = {`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        { account.type === 'person' ? 'Personal Account' : 'Company Page' }
                        </p>
                        </div>
                        </div>
                        < button className = {`w-full py-2 border rounded-lg text-sm font-medium ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}>
                            View Profile
                                </button>
                                </div>
        ))}
</div>
    </div>
  );
}

// Settings Page Component
function SettingsPage({ darkMode, cardClass, secondaryClass, textClass }) {
    return (
        <div className= "space-y-8" >
        <div>
        <h2 className="text-3xl font-bold" > Settings </h2>
            < p className = {`${secondaryClass} mt-1`
}> Configure brand voice, posting schedule, and preferences </p>
    </div>

    < div className = {`border rounded-xl p-8 ${cardClass} max-w-2xl`}>
        <h3 className="text-lg font-bold mb-6" > Brand Profile </h3>
            < div className = "space-y-6" >
                <div>
                <label className="block text-sm font-medium mb-2" > Brand Voice </label>
                    < textarea
placeholder = "How do you communicate? E.g., 'Thought leader, educational, first-person'"
className = {`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300'
    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
rows = { 3}
    />
    </div>

    < div >
    <label className="block text-sm font-medium mb-2" > Tone </label>
        < select className = {`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300'
            }`}>
                <option>Professional </option>
                < option > Casual </option>
                < option > Witty </option>
                < option > Educational </option>
                </select>
                </div>

                < div >
                <label className="block text-sm font-medium mb-2" > Content Pillars </label>
                    < input
type = "text"
placeholder = "E.g., AI, Startups, Growth (comma-separated)"
className = {`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300'
    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
    </div>

    < div >
    <label className="block text-sm font-medium mb-2" > Hashtags </label>
        < input
type = "text"
placeholder = "#AI #Startup #Growth"
className = {`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300'
    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
    </div>

    < button className = "w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow" >
        Save Settings
            </button>
            </div>
            </div>

            < div className = {`border rounded-xl p-8 ${cardClass} max-w-2xl`}>
                <h3 className="text-lg font-bold mb-6" > Posting Schedule </h3>
                    < div className = "space-y-6" >
                        <div>
                        <label className="block text-sm font-medium mb-2" > Post Frequency </label>
                            < select className = {`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300'
                                }`}>
                                    <option>1 post per day </option>
                                        < option > 3 posts per week </option>
                                            < option > 5 posts per week </option>
                                                </select>
                                                </div>

                                                < div >
                                                <label className="block text-sm font-medium mb-2" > Posting Times </label>
                                                    < div className = "space-y-2" >
                                                    {
                                                        ['09:00 AM', '02:00 PM', '06:00 PM'].map((time) => (
                                                            <label key= { time } className = "flex items-center gap-2" >
                                                            <input type="checkbox" className = "rounded" defaultChecked />
                                                        <span className="text-sm" > { time } </span>
                                                        </label>
                                                        ))
                                                    }
                                                        </div>
                                                        </div>

                                                        < button className = "w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow" >
                                                            Save Schedule
                                                                </button>
                                                                </div>
                                                                </div>
                                                                </div>
  );
}

// Analytics Page Component
function AnalyticsPage({ posts, darkMode, cardClass, secondaryClass, textClass }) {
    const totalImpressions = posts.reduce((sum, p) => sum + (p.metrics?.impressions || 0), 0);
    const totalEngagement = posts.reduce((sum, p) => sum + (p.metrics?.reactions || 0), 0);

    return (
        <div className= "space-y-8" >
        <div>
        <h2 className="text-3xl font-bold" > Analytics </h2>
            < p className = {`${secondaryClass} mt-1`
}> Track performance of your posted content </p>
    </div>

    < div className = "grid grid-cols-1 md:grid-cols-4 gap-4" >
        <KPICard title="Total Impressions" value = { totalImpressions.toLocaleString() } icon = { Eye } darkMode = { darkMode } />
            <KPICard title="Total Reactions" value = { totalEngagement.toLocaleString() } icon = { MessageSquare } darkMode = { darkMode } />
                <KPICard title="Avg Engagement" value = "6.2%" icon = { BarChart3 } darkMode = { darkMode } />
                    <KPICard title="Best Post" value = "1,234" icon = { CheckCircle } darkMode = { darkMode } />
                        </div>

                        < div className = {`border rounded-xl p-6 ${cardClass}`}>
                            <h3 className="text-lg font-bold mb-6" > Top Performing Posts </h3>
                                < div className = "space-y-4" >
                                {
                                    posts
            .filter((p) => p.metrics)
                                        .sort((a, b) => (b.metrics?.impressions || 0) - (a.metrics?.impressions || 0))
                                        .slice(0, 5)
                                        .map((post) => (
                                            <div key= { post.id } className = "flex justify-between items-center p-4 border border-slate-300 rounded-lg" >
                                            <div>
                                            <p className="text-sm font-medium" > { post.text.substring(0, 60) }...</p>
                                            < p className = {`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} >
                                    { new Date(post.scheduledTime).toLocaleDateString() }
                                    </p>
                                    </div>
                                    < div className = "flex gap-6 text-sm" >
                                        <div>
                                        <p className={ `${darkMode ? 'text-slate-400' : 'text-slate-500'} text-xs` }> Impressions </p>
                                            < p className = "font-bold" > { post.metrics?.impressions } </p>
                                                </div>
                                                < div >
                                                <p className={ `${darkMode ? 'text-slate-400' : 'text-slate-500'} text-xs` }> Engagement </p>
                                                    < p className = "font-bold" > { Math.round((post.metrics?.reactions || 0) / (post.metrics?.impressions || 1) * 100) } % </p>
                                                        </div>
                                                        </div>
                                                        </div>
            ))}
</div>
    </div>
    </div>
  );
}