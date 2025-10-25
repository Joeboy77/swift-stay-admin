import React, { useState, useEffect } from 'react';
import { Settings, DollarSign, Calculator } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import apiService from '../services/api';

interface CommissionSettings {
  commission_percentage: number;
}

const CommissionSettingsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<CommissionSettings>({ commission_percentage: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [samplePrice, setSamplePrice] = useState<number>(100);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCommissionSettings();
      if (response.success && response.data) {
        const data = response.data as any;
        setSettings({
          commission_percentage: data.commission_percentage || 5
        });
      }
    } catch (error) {
      console.error('Error fetching commission settings:', error);
      setError('Failed to load commission settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await apiService.updateCommissionSettings({
        commission_percentage: settings.commission_percentage
      });

      if (response.success) {
        setSuccess('Commission settings updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to update commission settings');
      }
    } catch (error) {
      console.error('Error updating commission settings:', error);
      setError('Failed to update commission settings');
    } finally {
      setSaving(false);
    }
  };

  const calculateCommission = (price: number) => {
    const commission = (price * settings.commission_percentage) / 100;
    const total = price + commission;
    return { commission, total };
  };

  const sampleCalculation = calculateCommission(samplePrice);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading commission settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1">
        <MobileMenuButton onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Commission Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure the global commission percentage applied to all room prices
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 text-red-500">⚠</div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 text-green-500">✓</div>
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Commission Settings Form */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Commission Configuration</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Commission Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={settings.commission_percentage}
                    onChange={(e) => setSettings({
                      ...settings,
                      commission_percentage: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter commission percentage"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  This percentage will be added to all room base prices
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || settings.commission_percentage < 0}
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Commission Settings'
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Price Preview</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sample Room Price
                </label>
                <input
                  type="number"
                  min="1"
                  value={samplePrice}
                  onChange={(e) => setSamplePrice(parseFloat(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter sample price"
                />
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Commission Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base Price:</span>
                    <span className="text-sm font-medium text-foreground">₵{samplePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Commission ({settings.commission_percentage}%):</span>
                    <span className="text-sm font-medium text-green-600">₵{sampleCalculation.commission.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">Total User Pays:</span>
                      <span className="text-sm font-bold text-primary">₵{sampleCalculation.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-orange-800 mb-2">Payment Options Preview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-700">40% Payment (Now):</span>
                    <span className="font-medium text-orange-800">₵{(sampleCalculation.total * 0.4).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">60% Payment (On Arrival):</span>
                    <span className="font-medium text-orange-800">₵{(sampleCalculation.total * 0.6).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Important Notes</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Commission changes only affect new bookings</li>
            <li>• Existing bookings will maintain their original pricing</li>
            <li>• Users will see the total price (base + commission) as the room rate</li>
            <li>• Commission is calculated automatically when creating/updating room types</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CommissionSettingsPage;