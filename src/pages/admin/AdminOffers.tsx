import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Flame } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  cta_text: string | null;
  cta_link: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminOffers = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cta_text: 'View Offer',
    cta_link: '',
    is_active: true,
  });

  const { data: offers, isLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Offer[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('special_offers').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      toast({ title: 'Offer created successfully' });
      resetForm();
    },
    onError: () => {
      toast({ title: 'Failed to create offer', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('special_offers').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-offer'] });
      toast({ title: 'Offer updated successfully' });
      resetForm();
    },
    onError: () => {
      toast({ title: 'Failed to update offer', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('special_offers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-offer'] });
      toast({ title: 'Offer deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete offer', variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('special_offers').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-offer'] });
    },
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', cta_text: 'View Offer', cta_link: '', is_active: true });
    setEditingOffer(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      cta_text: offer.cta_text || 'View Offer',
      cta_link: offer.cta_link || '',
      is_active: offer.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="h-6 w-6" />
              Special Offers Management
            </h1>
            <p className="text-muted-foreground">Manage promotional offers and discounts</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Offer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingOffer ? 'Edit Offer' : 'Add New Offer'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Winter Sale - 20% OFF"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the offer details..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cta_text">Button Text</Label>
                    <Input
                      id="cta_text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta_link">Button Link</Label>
                    <Input
                      id="cta_link"
                      value={formData.cta_link}
                      onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                      placeholder="/category/groceries"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-4">
            {offers?.map((offer) => (
              <Card key={offer.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{offer.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={offer.is_active}
                        onCheckedChange={(checked) =>
                          toggleActiveMutation.mutate({ id: offer.id, is_active: checked })
                        }
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(offer.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {offer.description && (
                    <p className="text-muted-foreground mb-2">{offer.description}</p>
                  )}
                  {offer.cta_link && (
                    <p className="text-sm text-primary">
                      CTA: {offer.cta_text} → {offer.cta_link}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {offers?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No offers yet</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOffers;
