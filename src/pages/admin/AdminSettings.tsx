import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, User, Mail, Clock, Store, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface StoreSettings {
  store_open_time: string;
  store_close_time: string;
  store_force_status: 'auto' | 'open' | 'closed';
  store_closed_message: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    store_open_time: '09:00',
    store_close_time: '21:00',
    store_force_status: 'auto',
    store_closed_message: 'Store is closed right now. Please come back during store hours.',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsMap: Partial<StoreSettings> = {};
      data?.forEach((item: { setting_key: string; setting_value: string }) => {
        settingsMap[item.setting_key as keyof StoreSettings] = item.setting_value as any;
      });

      setSettings({
        store_open_time: settingsMap.store_open_time || '09:00',
        store_close_time: settingsMap.store_close_time || '21:00',
        store_force_status: (settingsMap.store_force_status as 'auto' | 'open' | 'closed') || 'auto',
        store_closed_message: settingsMap.store_closed_message || 'Store is closed right now.',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('store_settings')
          .update({ setting_value: update.setting_value })
          .eq('setting_key', update.setting_key);

        if (error) throw error;
      }

      toast({ title: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    if (settings.store_force_status === 'open') {
      return <Badge className="bg-green-500">Force Open</Badge>;
    }
    if (settings.store_force_status === 'closed') {
      return <Badge variant="destructive">Force Closed</Badge>;
    }
    return <Badge variant="secondary">Auto (Based on Hours)</Badge>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Admin Profile
            </CardTitle>
            <CardDescription>
              Your admin account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Administrator</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account is secured with email/password authentication.
              Role-based access control is enforced through the database.
            </p>
            <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Admin Role Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Hours Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Store Hours & Availability
          </CardTitle>
          <CardDescription>
            Control when customers can place orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Current Status:</span>
                {getStatusBadge()}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="open_time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Opening Time
                  </Label>
                  <Input
                    id="open_time"
                    type="time"
                    value={settings.store_open_time}
                    onChange={(e) =>
                      setSettings({ ...settings, store_open_time: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="close_time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Closing Time
                  </Label>
                  <Input
                    id="close_time"
                    type="time"
                    value={settings.store_close_time}
                    onChange={(e) =>
                      setSettings({ ...settings, store_close_time: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="force_status">Override Status</Label>
                  <Select
                    value={settings.store_force_status}
                    onValueChange={(value: 'auto' | 'open' | 'closed') =>
                      setSettings({ ...settings, store_force_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Based on Hours)</SelectItem>
                      <SelectItem value="open">Force Open</SelectItem>
                      <SelectItem value="closed">Force Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Override automatic open/close based on time
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closed_message">Closed Message</Label>
                <Textarea
                  id="closed_message"
                  value={settings.store_closed_message}
                  onChange={(e) =>
                    setSettings({ ...settings, store_closed_message: e.target.value })
                  }
                  placeholder="Message shown to customers when store is closed"
                  rows={2}
                />
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>
            Navigate to different sections of the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/admin/products">
              <Button variant="outline" className="w-full">Products</Button>
            </a>
            <a href="/admin/categories">
              <Button variant="outline" className="w-full">Categories</Button>
            </a>
            <a href="/admin/orders">
              <Button variant="outline" className="w-full">Orders</Button>
            </a>
            <a href="/admin/banners">
              <Button variant="outline" className="w-full">Banners</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
