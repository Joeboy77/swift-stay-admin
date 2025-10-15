import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Users, RefreshCw, Phone, Mail, MapPin, Home } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import apiService from '../services/api';

interface OwnerApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  propertyName: string;
  city: string;
  region: string;
  propertyType: string | null;
  unitsAvailable: number | null;
  message: string | null;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  createdAt: string;
}

const PartnerApplicationsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<OwnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getOwnerApplications(page, limit, statusFilter !== 'all' ? statusFilter : undefined);
      if (res.success && res.data) {
        const data = res.data as any;
        setItems(data.items || []);
        setTotal(data.total || 0);
      } else {
        setError(res.message || 'Failed to fetch applications');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: OwnerApplication['status']) => {
    const isApprove = status === 'approved';
    try {
      isApprove ? setApprovingId(id) : setRejectingId(id);
      const res = await apiService.updateOwnerApplicationStatus(id, status);
      if (res.success) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      }
    } catch (e) {
      // noop
    } finally {
      isApprove ? setApprovingId(null) : setRejectingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Partner Applications</h1>
                <p className="text-muted-foreground mt-1">Review and manage owner partnership requests</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button 
                onClick={fetchData}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-destructive">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Property</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((app) => (
                      <tr key={app.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">{app.fullName}</div>
                          <div className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground flex items-center space-x-2">
                            <Mail className="w-3 h-3 text-muted-foreground" /><span>{app.email}</span>
                          </div>
                          <div className="text-sm text-foreground flex items-center space-x-2 mt-1">
                            <Phone className="w-3 h-3 text-muted-foreground" /><span>{app.phone || '-'}</span>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" /><span>{app.city}, {app.region}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground flex items-center space-x-2">
                            <Home className="w-3 h-3 text-muted-foreground" /><span>{app.propertyName}</span>
                          </div>
                          {app.propertyType && (
                            <div className="text-xs text-muted-foreground mt-1">Type: {app.propertyType}</div>
                          )}
                          {app.unitsAvailable !== null && (
                            <div className="text-xs text-muted-foreground">Units: {app.unitsAvailable}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => updateStatus(app.id, 'approved')}
                              disabled={approvingId === app.id || rejectingId === app.id}
                              className={`px-3 py-1 rounded transition-colors flex items-center space-x-1 ${
                                approvingId === app.id
                                  ? 'bg-green-600/70 text-white cursor-wait'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>{approvingId === app.id ? 'Approving...' : 'Approve'}</span>
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'rejected')}
                              disabled={approvingId === app.id || rejectingId === app.id}
                              className={`px-3 py-1 rounded transition-colors flex items-center space-x-1 ${
                                rejectingId === app.id
                                  ? 'bg-red-600/70 text-white cursor-wait'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>{rejectingId === app.id ? 'Rejecting...' : 'Reject'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <div className="text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No applications found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PartnerApplicationsPage;


