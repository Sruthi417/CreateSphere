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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdminAuthenticated, userRole } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [pendingCreators, setPendingCreators] = useState([]);
  const [priorityReports, setPriorityReports] = useState([]);
  const [reportedCreators, setReportedCreators] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectDialog, setRejectDialog] = useState({ open: false, creatorId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [banDialog, setBanDialog] = useState({ open: false, targetId: '', targetType: '', targetName: '' });
  const [banReason, setBanReason] = useState('');
  const [reportDetailsDialog, setReportDetailsDialog] = useState({ open: false, targetId: '', reports: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated && userRole !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [isAdminAuthenticated, userRole]);

  const fetchData = async () => {
    try {
      const [creatorsRes, reportsRes, reportedCreatorsRes, adminsRes] = await Promise.all([
        adminAPI.getPendingVerifications().catch(() => ({ data: { data: [] } })),
        adminAPI.getPriorityReports().catch(() => ({ data: { data: [] } })),
        adminAPI.getReportedCreators().catch(() => ({ data: { data: [] } })),
        adminAPI.getAdmins().catch(() => ({ data: { data: [] } })),
      ]);
      setPendingCreators(creatorsRes.data.data || []);
      setPriorityReports(reportsRes.data.data || []);
      setReportedCreators(reportedCreatorsRes.data.data || []);
      setAdminsList(adminsRes.data.data || []);
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

  const handleHideContent = async (targetType, targetId) => {
    setActionLoading(`hide-${targetId}`);
    try {
      await adminAPI.hideContent(targetType, targetId);
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
      toast.error('Please provide a reason for the ban');
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage creators, content, and reports
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{pendingCreators.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Pending Verifications</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-destructive" />
                  <span className="text-2xl font-bold">{priorityReports.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Priority Reports</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">-</span>
                </div>
                <p className="text-sm text-muted-foreground">Active Chatbot Sessions</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-4 whitespace-nowrap overflow-x-auto">
                <TabsTrigger value="reports">
                  <Flag className="h-4 w-4 mr-2" />
                  Priority Reports ({priorityReports.length})
                </TabsTrigger>
                <TabsTrigger value="reported-creators">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Reported Creators ({reportedCreators.length})
                </TabsTrigger>
                <TabsTrigger value="verifications">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verifications ({pendingCreators.length})
                </TabsTrigger>
                <TabsTrigger value="admins">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Admins List ({adminsList.length})
                </TabsTrigger>
              </TabsList>

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
                              <AvatarImage src={creator.avatarUrl} />
                              <AvatarFallback>
                                {creator.creatorProfile?.displayName?.charAt(0) || creator.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">
                                  {creator.creatorProfile?.displayName || creator.name}
                                </h3>
                                {creator.priorityScore && (
                                  <Badge variant="outline">Priority: {creator.priorityScore}</Badge>
                                )}
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
                                <img src={report.content.image} alt="" className="h-16 w-16 object-cover rounded-lg border" />
                              ) : report.content?.avatarUrl ? (
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={report.content.avatarUrl} />
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

                              {/* Allow banning the creator for ANY report type (direct or content-based) */}
                              {((['creator', 'user'].includes(report._id?.targetType || report.targetType)) || report.creator) &&
                                (report.content?.moderation?.status !== 'banned' && report.creator?.moderation?.status !== 'banned') && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => setBanDialog({
                                      open: true,
                                      targetId: report.creator?._id || report._id?.targetId || report.targetId,
                                      targetType: report.creator ? 'creator' : (report._id?.targetType || report.targetType),
                                      targetName: report.creator?.name || report.content?.name || report.content?.title || 'Account'
                                    })}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Ban {report.creator ? 'Creator' : 'Account'}
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
                              <AvatarImage src={report.content?.avatarUrl} />
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
                            <AvatarImage src={admin.avatarUrl} />
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
                              <AvatarImage src={creator.avatarUrl} />
                              <AvatarFallback>
                                {creator.creatorProfile?.displayName?.charAt(0) || creator.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{creator.creatorProfile?.displayName || creator.name}</h3>
                                <Badge variant="outline">{creator.email}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                {creator.creatorProfile?.bio}
                              </p>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>Category: {creator.creatorProfile?.category}</span>
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
            </Tabs>
          </motion.div>
        </div>
      </main>

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
    </div>
  );
}
