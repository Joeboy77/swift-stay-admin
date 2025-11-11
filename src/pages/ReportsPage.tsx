import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import apiService from '../services/api';
import { FileText, TrendingUp, Building2, Calendar } from 'lucide-react';

interface PropertyEarnings {
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  propertyCity: string;
  totalBookings: number;
  totalEarnings: number;
  totalCommission: number;
  totalRevenue: number;
}

interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  properties: PropertyEarnings[];
  totals: {
    totalBookings: number;
    totalEarnings: number;
    totalCommission: number;
    totalRevenue: number;
  };
}

const ReportsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getPropertyEarningsReport(period);
      if (response.success && response.data) {
        setReportData(response.data as ReportData);
      } else {
        setError(response.message || 'Failed to fetch report');
      }
    } catch (err: any) {
      console.error('Error fetching report:', err);
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'Today';
      case 'weekly': return 'Last 7 Days';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
      default: return period;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
                  Property Earnings Reports
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Track property earnings and revenue for accountability
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-6">

          {/* Period Selector */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="text-sm font-medium text-foreground">
                Report Period:
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      period === p
                        ? 'bg-primary text-white'
                        : 'bg-accent text-foreground hover:bg-accent/80'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading report...</p>
            </div>
          ) : reportData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {reportData.properties.length}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {reportData.totals.totalBookings}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {formatCurrency(reportData.totals.totalEarnings)}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {formatCurrency(reportData.totals.totalRevenue)}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Period Info */}
              <div className="bg-card border border-border rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Report Period</p>
                    <p className="text-lg font-semibold text-foreground">
                      {getPeriodLabel(reportData.period)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Properties Table */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">
                    Property Earnings Breakdown
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Bookings
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Earnings
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Commission
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Total Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {reportData.properties.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-muted-foreground">
                            No earnings data available for this period
                          </td>
                        </tr>
                      ) : (
                        reportData.properties.map((property) => (
                          <tr key={property.propertyId} className="hover:bg-accent/50 transition-colors">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-foreground">
                                {property.propertyName}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-muted-foreground">
                                {property.propertyLocation}, {property.propertyCity}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm text-foreground">
                              {property.totalBookings}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(property.totalEarnings)}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm text-muted-foreground">
                              {formatCurrency(property.totalCommission)}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-primary">
                              {formatCurrency(property.totalRevenue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {reportData.properties.length > 0 && (
                      <tfoot className="bg-muted/50">
                        <tr>
                          <td colSpan={2} className="px-4 sm:px-6 py-4 text-sm font-semibold text-foreground">
                            Totals
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-right text-sm font-semibold text-foreground">
                            {reportData.totals.totalBookings}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(reportData.totals.totalEarnings)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-right text-sm font-semibold text-muted-foreground">
                            {formatCurrency(reportData.totals.totalCommission)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-right text-sm font-semibold text-primary">
                            {formatCurrency(reportData.totals.totalRevenue)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;

