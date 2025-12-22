import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, User, Mail } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();

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
