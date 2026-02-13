'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { adminAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Users,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bot,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Star,
  Plus,
  Tag,
  Search,
  Bell,
  Menu,
  ChevronRight,
  LogOut,
  ExternalLink,
  Settings,
  MoreVertical,
  LayoutDashboard,
  BadgeCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { categoryAPI } from '@/lib/api-client';
import { getImageUrl } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all bg-white">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 leading-none">{value}</h3>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdminAuthenticated, userRole } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [pendingCreators, setPendingCreators] = useState([]);
  const [priorityReports, setPriorityReports] = useState([]);
  const [reportedCreators, setReportedCreators] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [verifiedCreators, setVerifiedCreators] = useState([]);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectDialog, setRejectDialog] = useState({ open: false, creatorId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [banDialog, setBanDialog] = useState({ open: false, targetId: '', targetType: '', targetName: '' });
  const [banReason, setBanReason] = useState('');
  const [reportDetailsDialog, setReportDetailsDialog] = useState({ open: false, targetId: '', reports: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', type: 'both' });
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');

  const sidebarItems = [
    { id: 'reports', label: 'Priority Reports', icon: Flag, count: priorityReports.length },
    { id: 'creators', label: 'Reported Creators', icon: AlertTriangle, count: reportedCreators.length },
    { id: 'verifications', label: 'Verifications', icon: CheckCircle2, count: pendingCreators.length },
    { id: 'verified', label: 'Verified Creators', icon: BadgeCheck, count: verifiedCreators.length },
    { id: 'admins', label: 'Admins List', icon: ShieldCheck, count: adminsList.length },
    { id: 'categories', label: 'Categories', icon: Tag, count: categories.length },
  ];

  useEffect(() => {
    if (!isAdminAuthenticated && userRole !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [isAdminAuthenticated, userRole]);

  const fetchData = async () => {
    try {
      const [creatorsRes, verifiedRes, reportsRes, reportedCreatorsRes, adminsRes, categoriesRes] = await Promise.all([
        adminAPI.getPendingVerifications().catch(() => ({ data: { data: [] } })),
        adminAPI.getVerifiedCreators().catch(() => ({ data: { data: [] } })),
        adminAPI.getPriorityReports().catch(() => ({ data: { data: [] } })),
        adminAPI.getReportedCreators().catch(() => ({ data: { data: [] } })),
        adminAPI.getAdmins().catch(() => ({ data: { data: [] } })),
        categoryAPI.list().catch(() => ({ data: { data: [] } })),
      ]);
      setPendingCreators(creatorsRes.data.data || []);
      setVerifiedCreators(verifiedRes.data.data || []);
      setPriorityReports(reportsRes.data.data || []);
      setReportedCreators(reportedCreatorsRes.data.data || []);
      setAdminsList(adminsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCreator = async (creatorId) => {
    setActionLoading(creatorId);
    try {
      await adminAPI.verifyCreator(creatorId);
      toast.success('Creator verified successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify creator');
    } finally {
      setActionLoading('');
    }
  };

  const handleRejectCreator = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(rejectDialog.creatorId);
    try {
      await adminAPI.rejectCreator(rejectDialog.creatorId, rejectReason);
      toast.success('Creator rejected');
      setRejectDialog({ open: false, creatorId: '' });
      setRejectReason('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject creator');
    } finally {
      setActionLoading('');
    }
  };

  const handleRevokeVerification = async (creatorId) => {
    setActionLoading(creatorId);
    try {
      await adminAPI.revokeCreator(creatorId);
      toast.success('Verification removed');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove verification');
    } finally {
      setActionLoading('');
    }
  };

  const handleHideContent = async (targetType, targetId, reason) => {
    setActionLoading(`hide-${targetId}`);
    try {
      await adminAPI.hideContent(targetType, targetId, reason || 'Hidden by admin');
      toast.success('Content hidden');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to hide content');
    } finally {
      setActionLoading('');
    }
  };

  const handleRestoreContent = async (targetType, targetId) => {
    setActionLoading(`restore-${targetId}`);
    try {
      await adminAPI.restoreContent(targetType, targetId);
      toast.success('Content restored');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore content');
    } finally {
      setActionLoading('');
    }
  };

  const handleRemoveContent = async (targetType, targetId) => {
    setActionLoading(`remove-${targetId}`);
    try {
      await adminAPI.removeContent(targetType, targetId);
      toast.success('Content removed permanently');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove content');
    } finally {
      setActionLoading('');
    }
  };

  const handleBanAccount = async () => {
    if (!banReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    if (['product', 'tutorial'].includes(banDialog.targetType)) {
      await handleHideContent(banDialog.targetType, banDialog.targetId, banReason);
      setBanDialog({ open: false, targetId: '', targetType: '', targetName: '' });
      setBanReason('');
      return;
    }

    setActionLoading(`ban-${banDialog.targetId}`);
    try {
      await adminAPI.moderateUser(banDialog.targetId, {
        action: 'ban',
        reason: banReason,
      });
      toast.success('Account banned successfully');
      setBanDialog({ open: false, targetId: '', targetType: '', targetName: '' });
      setBanReason('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to ban account');
    } finally {
      setActionLoading('');
    }
  };

  const handleDismissReports = async (targetId) => {
    setActionLoading(`dismiss-${targetId}`);
    try {
      await adminAPI.dismissReports(targetId);
      toast.success('Reports cleared');
      fetchData();
    } catch (error) {
      toast.error('Failed to clear reports');
    } finally {
      setActionLoading('');
    }
  };

  const handleViewReportDetails = async (targetId) => {
    setLoadingDetails(true);
    setReportDetailsDialog({ open: true, targetId, reports: [] });
    try {
      const response = await adminAPI.getReportDetails(targetId);
      setReportDetailsDialog(prev => ({ ...prev, reports: response.data.data }));
    } catch (error) {
      toast.error('Failed to load report details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setCategoryLoading(true);
    try {
      await categoryAPI.create(newCategory);
      toast.success('Category created successfully');
      setNewCategory({ name: '', description: '', type: 'both' });
      setCategoryDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to deactivate this category?')) return;
    try {
      await categoryAPI.deactivate(id);
      toast.success('Category deactivated');
      fetchData();
    } catch (error) {
      toast.error('Failed to deactivate category');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full"
          />
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Authenticating Admin</h2>
            <p className="text-slate-500 text-sm">Securely loading control panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 z-50">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="text-white h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg leading-none">CreateSphere</h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">Admin Control Panel</span>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95' : 'hover:bg-slate-800/50 hover:text-white'}`}
              >
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
                <span className="font-semibold text-sm">{item.label}</span>
                {item.count > 0 && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-lg ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 border border-slate-700">
                <AvatarFallback className="bg-slate-700 text-white text-xs">AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Administrator</p>
                <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-tighter">System Manager</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs border-slate-700 hover:bg-slate-800 hover:text-white bg-transparent"
              onClick={() => router.push('/')}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top bar header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="lg:hidden mr-2">
              <Menu className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                Overview <ChevronRight className="h-3 w-3" /> {activeTab.replace('-', ' ')}
              </div>
              <h1 className="text-xl font-bold text-slate-900 capitalize">
                {sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200 focus-within:border-primary/50 transition-all">
              <Search className="h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search everywhere..." className="bg-transparent border-none text-sm focus:outline-none text-slate-600 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl relative hover:bg-slate-100">
                <Bell className="h-5 w-5 text-slate-500" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
              </Button>
              <div className="w-px h-6 bg-slate-200 mx-2" />
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                <Settings className="h-5 w-5 text-slate-500" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dynamic Content Region */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
          {/* Quick Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            <StatCard icon={Flag} label="Reports" value={priorityReports.length} color="bg-rose-500" />
            <StatCard icon={AlertTriangle} label="Reported" value={reportedCreators.length} color="bg-amber-500" />
            <StatCard icon={CheckCircle2} label="Pending" value={pendingCreators.length} color="bg-emerald-500" />
            <StatCard icon={BadgeCheck} label="Verified" value={verifiedCreators.length} color="bg-blue-500" />
            <StatCard icon={ShieldCheck} label="Admins" value={adminsList.length} color="bg-indigo-500" />
          </div>

          <Tabs value={activeTab} className="w-full">
            {/* hidden tab list, controlled by sidebar */}
            <TabsList className="hidden" />

            <TabsContent value="verifications" className="mt-6">
              {pendingCreators.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-muted-foreground">No pending verifications</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingCreators.map((creator) => (
                    <Card key={creator._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={getImageUrl(creator.avatarUrl)} />
                            <AvatarFallback>
                              {creator.creatorProfile?.displayName?.charAt(0) || creator.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {creator.creatorProfile?.displayName || creator.name}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {creator.email}
                            </p>
                            {creator.creatorProfile?.fullBio && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {creator.creatorProfile.fullBio}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {creator.creatorProfile?.followersCount || 0} followers
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {creator.creatorProfile?.rating?.toFixed(1) || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleVerifyCreator(creator._id)}
                              disabled={actionLoading === creator._id}
                            >
                              {actionLoading === creator._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectDialog({ open: true, creatorId: creator._id })}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="verified" className="mt-6">
              {verifiedCreators.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BadgeCheck className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-muted-foreground">No verified creators yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verifiedCreators.map((creator) => (
                    <Card key={creator._id} className="overflow-hidden border-blue-100 bg-blue-50/10 hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                            <AvatarImage src={getImageUrl(creator.avatarUrl)} />
                            <AvatarFallback>{(creator.creatorProfile?.displayName || creator.name)?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h3 className="font-bold text-slate-900 truncate">
                                {creator.creatorProfile?.displayName || creator.name}
                              </h3>
                              <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
                            </div>
                            <p className="text-xs text-slate-500 truncate mb-2">{creator.email}</p>
                            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                              <span>Verified: {new Date(creator.verifiedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={() => handleRevokeVerification(creator._id)}
                            disabled={actionLoading === creator._id}
                          >
                            {actionLoading === creator._id && (
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            )}
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              {priorityReports.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-muted-foreground">No priority reports</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {priorityReports.map((report, index) => (
                    <Card key={index} className={report.content?.moderation?.status === 'banned' ? 'opacity-50 grayscale' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            {report.content?.image ? (
                              <img src={getImageUrl(report.content.image)} alt="" className="h-16 w-16 object-cover rounded-lg border" />
                            ) : report.content?.avatarUrl ? (
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={getImageUrl(report.content.avatarUrl)} />
                                <AvatarFallback>{report.content.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                                <Flag className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="destructive" className="capitalize">
                                  {report._id?.targetType || report.targetType}
                                </Badge>
                                <Badge variant="outline">
                                  {report.count || 1} reports
                                </Badge>
                                {report.content?.moderation?.status === 'banned' && (
                                  <Badge variant="secondary">BANNED</Badge>
                                )}
                              </div>
                              <h3 className="font-semibold mb-1">
                                {report.content?.title || report.content?.name || `Target: ${report._id?.targetId}`}
                              </h3>
                              {report.content?.email && (
                                <p className="text-xs text-muted-foreground mb-1">{report.content.email}</p>
                              )}
                              {report.reasons && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {Array.from(new Set(report.reasons)).slice(0, 3).map((reason, i) => (
                                    <Badge key={i} variant="secondary" className="text-[10px] py-0">
                                      {reason}
                                    </Badge>
                                  ))}
                                  {report.reasons.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground">+{report.reasons.length - 3} more</span>
                                  )}
                                </div>
                              )}
                              {report.creator && (['product', 'tutorial'].includes(report._id?.targetType || report.targetType)) && (
                                <div className="mt-2 p-2 bg-muted/30 rounded border border-dashed text-xs">
                                  <span className="text-muted-foreground">Creator: </span>
                                  <span className="font-medium text-primary">{report.creator.name}</span>
                                  {report.creator.moderation?.status === 'banned' && (
                                    <Badge variant="destructive" className="ml-2 h-4 text-[8px] px-1">BANNED</Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => handleViewReportDetails(report._id?.targetId || report.targetId)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>

                            {/* Specific Content Ban (Hide) */}
                            {['product', 'tutorial'].includes(report._id?.targetType || report.targetType) && (
                              <Button
                                size="sm"
                                variant={report.content?.status === 'hidden' ? "secondary" : "destructive"}
                                className="w-full"
                                onClick={() => report.content?.status === 'hidden'
                                  ? handleRestoreContent(report._id?.targetType || report.targetType, report._id?.targetId || report.targetId)
                                  : setBanDialog({
                                    open: true,
                                    targetId: report._id?.targetId || report.targetId,
                                    targetType: report._id?.targetType || report.targetType,
                                    targetName: report.content?.title || 'this content'
                                  })
                                }
                                disabled={actionLoading === `hide-${report._id?.targetId || report.targetId}` || actionLoading === `restore-${report._id?.targetId || report.targetId}`}
                              >
                                {report.content?.status === 'hidden' ? (
                                  <>
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Restore Content
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-1" />
                                    Ban Content (Hide)
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Allow banning the creator for ANY report type (direct or content-based) */}
                            {((['creator', 'user'].includes(report._id?.targetType || report.targetType)) || report.creator) &&
                              (report.content?.moderation?.status !== 'banned' && report.creator?.moderation?.status !== 'banned') && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="w-full opacity-70 hover:opacity-100"
                                  onClick={() => setBanDialog({
                                    open: true,
                                    targetId: report.creator?._id || report._id?.targetId || report.targetId,
                                    targetType: report.creator ? 'creator' : (report._id?.targetType || report.targetType),
                                    targetName: report.creator?.name || report.content?.name || report.content?.title || 'Account'
                                  })}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Block Creator Account
                                </Button>
                              )}

                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full hover:bg-green-100 hover:text-green-700"
                              onClick={() => handleDismissReports(report._id?.targetId || report.targetId)}
                              disabled={actionLoading === `dismiss-${report._id?.targetId || report.targetId}`}
                            >
                              {actionLoading === `dismiss-${report._id?.targetId || report.targetId}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                              )}
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reported-creators" className="mt-6">
              {reportedCreators.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-muted-foreground">No creators currently reported</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reportedCreators.map((report) => (
                    <Card key={report._id.targetId}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border">
                            <AvatarImage src={getImageUrl(report.content?.avatarUrl)} />
                            <AvatarFallback>{report.content?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{report.content?.name}</h3>
                              <Badge variant="outline">{report.count} Reports</Badge>
                              {report.content?.moderation?.status === 'banned' && (
                                <Badge variant="destructive">BANNED</Badge>
                              )}
                              {report.content?.creatorProfile?.verified && (
                                <Badge className="bg-blue-100 text-blue-600 border-blue-200">Verified</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{report.content?.email}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Rating: {report.content?.creatorProfile?.rating?.toFixed(1) || 'N/A'}</span>
                              <span>Followers: {report.content?.creatorProfile?.followersCount || 0}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewReportDetails(report._id.targetId)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Reports
                            </Button>
                            {report.content?.moderation?.status !== 'banned' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setBanDialog({
                                  open: true,
                                  targetId: report._id.targetId,
                                  targetType: 'creator',
                                  targetName: report.content?.name
                                })}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="admins" className="mt-6">
              <div className="space-y-4">
                {adminsList.map((admin) => (
                  <Card key={admin._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border border-primary/20">
                          <AvatarImage src={getImageUrl(admin.avatarUrl)} />
                          <AvatarFallback>{admin.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{admin.name}</h3>
                            {admin.adminDetails?.isSuperAdmin && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200">Super Admin</Badge>
                            )}
                            {admin.moderation?.status === 'banned' && (
                              <Badge variant="destructive">BANNED</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">Joined: {new Date(admin.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          {/* Only Super Admins can ban other admins, and can't ban self */}
                          {userRole === 'admin' && admin.moderation?.status !== 'banned' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setBanDialog({
                                open: true,
                                targetId: admin._id,
                                targetType: 'user',
                                targetName: admin.name
                              })}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Ban Admin
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="categories" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Manage Categories</h2>
                <Button onClick={() => setCategoryDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Category
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground bg-white rounded-xl border border-dashed">
                    No categories found. Start by creating one!
                  </div>
                ) : (
                  categories.map((cat) => (
                    <Card key={cat._id} className={!cat.isActive ? 'opacity-50' : ''}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{cat.name}</CardTitle>
                          <Badge variant={cat.type === 'product' ? 'secondary' : (cat.type === 'tutorial' ? 'outline' : 'default')}>
                            {cat.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {cat.description || 'No description provided.'}
                        </p>
                        <div className="flex justify-end gap-2">
                          {cat.isActive !== false ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteCategory(cat._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Creator</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this creator verification request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, creatorId: '' })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectCreator}
              disabled={actionLoading === rejectDialog.creatorId}
            >
              {actionLoading === rejectDialog.creatorId && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialog.open} onOpenChange={(open) => setBanDialog({ ...banDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Account: {banDialog.targetName}</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently ban this account? This action is irreversible and will hide all associated content.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for ban..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialog({ open: false, targetId: '', targetType: '', targetName: '' })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanAccount}
              disabled={actionLoading === `ban-${banDialog.targetId}`}
            >
              {actionLoading === `ban-${banDialog.targetId}` && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Details Dialog */}
      <Dialog open={reportDetailsDialog.open} onOpenChange={(open) => setReportDetailsDialog({ ...reportDetailsDialog, open })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Viewing all individual reports submitted for this target.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {loadingDetails ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reportDetailsDialog.reports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reports found.</p>
            ) : (
              reportDetailsDialog.reports.map((report) => (
                <div key={report._id} className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold">{report.reporterId?.name || 'Anonymous User'}</span>
                    <Badge variant="outline">{report.reasonCode}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-2">
                    &quot;{report.additionalNote || 'No additional note provided.'}&quot;
                  </p>
                  <p className="text-[10px] text-muted-foreground text-right">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setReportDetailsDialog({ open: false, targetId: '', reports: [] })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for products and tutorials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g. Pottery, Digital Art"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Category description..."
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                className="w-full p-2 rounded-md border text-sm"
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
              >
                <option value="both">Both</option>
                <option value="product">Product Only</option>
                <option value="tutorial">Tutorial Only</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={categoryLoading}>
              {categoryLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
