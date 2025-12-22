import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
}

interface SavedAddress {
  id: string;
  label: string;
  address_line: string;
  city: string | null;
  pincode: string | null;
  is_default: boolean;
}

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number');

const Profile = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    address_line: '',
    city: '',
    pincode: '',
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      setPhoneInput(data?.phone || '');
      setNameInput(data?.full_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const updatePhone = async () => {
    const result = phoneSchema.safeParse(phoneInput);
    if (!result.success) {
      setPhoneError(result.error.errors[0].message);
      return;
    }
    setPhoneError('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: phoneInput })
        .eq('user_id', user!.id);

      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, phone: phoneInput } : null);
      setEditingPhone(false);
      toast.success('Phone number updated');
    } catch (error) {
      console.error('Error updating phone:', error);
      toast.error('Failed to update phone number');
    }
  };

  const updateName = async () => {
    if (!nameInput.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: nameInput })
        .eq('user_id', user!.id);

      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, full_name: nameInput } : null);
      setEditingName(false);
      toast.success('Name updated');
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error('Failed to update name');
    }
  };

  const addAddress = async () => {
    if (!newAddress.address_line.trim()) {
      toast.error('Address is required');
      return;
    }

    try {
      const { error } = await supabase.from('saved_addresses').insert({
        user_id: user!.id,
        label: newAddress.label,
        address_line: newAddress.address_line,
        city: newAddress.city || null,
        pincode: newAddress.pincode || null,
        is_default: addresses.length === 0,
      });

      if (error) throw error;
      fetchAddresses();
      setAddressDialogOpen(false);
      setNewAddress({ label: 'Home', address_line: '', city: '', pincode: '' });
      toast.success('Address added');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      // Remove default from all
      await supabase
        .from('saved_addresses')
        .update({ is_default: false })
        .eq('user_id', user!.id);

      // Set new default
      const { error } = await supabase
        .from('saved_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      fetchAddresses();
      toast.success('Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="container mx-auto px-4 py-16 text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Login to view profile</h1>
          <Link to="/auth">
            <Button>Login / Sign Up</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-6">My Profile</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* Profile Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium text-foreground">{user.email}</p>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  {editingName ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter your name"
                      />
                      <Button size="sm" onClick={updateName}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingName(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">
                        {profile?.full_name || 'Not set'}
                      </p>
                      <Button size="sm" variant="ghost" onClick={() => setEditingName(true)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone Number
                    {!profile?.phone && (
                      <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                    )}
                  </label>
                  {editingPhone ? (
                    <div className="space-y-2 mt-1">
                      <div className="flex gap-2">
                        <Input
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="Enter 10-digit phone number"
                          maxLength={10}
                        />
                        <Button size="sm" onClick={updatePhone}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingPhone(false);
                          setPhoneError('');
                        }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {phoneError && (
                        <p className="text-sm text-destructive">{phoneError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">
                        {profile?.phone ? `+91 ${profile.phone}` : 'Not set'}
                      </p>
                      <Button size="sm" variant="ghost" onClick={() => setEditingPhone(true)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Saved Addresses Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Saved Addresses
                </CardTitle>
                <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium">Label</label>
                        <Input
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          placeholder="Home, Office, etc."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Address</label>
                        <Input
                          value={newAddress.address_line}
                          onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                          placeholder="Street address, building, floor"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">City</label>
                          <Input
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Pincode</label>
                          <Input
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            placeholder="Pincode"
                            maxLength={6}
                          />
                        </div>
                      </div>
                      <Button className="w-full" onClick={addAddress}>
                        Save Address
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No saved addresses yet.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-3 border border-border rounded-lg flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{addr.label}</span>
                            {addr.is_default && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {addr.address_line}
                            {addr.city && `, ${addr.city}`}
                            {addr.pincode && ` - ${addr.pincode}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!addr.is_default && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDefaultAddress(addr.id)}
                              title="Set as default"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteAddress(addr.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
