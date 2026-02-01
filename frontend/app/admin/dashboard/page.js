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
  const [actionLoading, setActionLoading] = useState('');
  const [rejectDialog, setRejectDialog] = useState({ open: false, creatorId: '' });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated && userRole !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [isAdminAuthenticated, userRole]);

  const fetchData = async () => {
    try {
      const [creatorsRes, reportsRes] = await Promise.all([
        adminAPI.getPendingVerifications().catch(() => ({ data: { data: [] } })),
        adminAPI.getPriorityReports().catch(() => ({ data: { data: [] } })),
      ]);
      setPendingCreators(creatorsRes.data.data || []);
      setPriorityReports(reportsRes.data.data || []);
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
            <Tabs defaultValue="verifications" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="verifications">
                  <Users className="h-4 w-4 mr-2" />
                  Pending Verifications ({pendingCreators.length})
                </TabsTrigger>
                <TabsTrigger value="reports">
                  <Flag className="h-4 w-4 mr-2" />
                  Priority Reports ({priorityReports.length})
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
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="destructive">
                                  {report._id?.targetType || report.targetType}
                                </Badge>
                                <Badge variant="outline">
                                  {report.count || 1} reports
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Target ID: {report._id?.targetId || report.targetId}
                              </p>
                              {report.content && (
                                <p className="text-sm font-medium">
                                  {report.content.title}
                                </p>
                              )}
                              {report.reasons && (
                                <div className="flex gap-1 mt-2">
                                  {Object.entries(report.reasons).map(([reason, count]) => (
                                    <Badge key={reason} variant="secondary" className="text-xs">
                                      {reason}: {count}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {report.latestAt && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Latest: {new Date(report.latestAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleHideContent(
                                  report._id?.targetType || report.targetType,
                                  report._id?.targetId || report.targetId
                                )}
                                disabled={actionLoading === `hide-${report._id?.targetId || report.targetId}`}
                              >
                                {actionLoading === `hide-${report._id?.targetId || report.targetId}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <EyeOff className="h-4 w-4 mr-1" />
                                )}
                                Hide
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRestoreContent(
                                  report._id?.targetType || report.targetType,
                                  report._id?.targetId || report.targetId
                                )}
                                disabled={actionLoading === `restore-${report._id?.targetId || report.targetId}`}
                              >
                                {actionLoading === `restore-${report._id?.targetId || report.targetId}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                )}
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveContent(
                                  report._id?.targetType || report.targetType,
                                  report._id?.targetId || report.targetId
                                )}
                                disabled={actionLoading === `remove-${report._id?.targetId || report.targetId}`}
                              >
                                {actionLoading === `remove-${report._id?.targetId || report.targetId}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-1" />
                                )}
                                Remove
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
    </div>
  );
}
