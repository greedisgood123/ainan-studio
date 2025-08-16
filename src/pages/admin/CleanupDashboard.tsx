import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Database, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CleanupDashboardProps {
  adminToken: string;
}

export const CleanupDashboard: React.FC<CleanupDashboardProps> = ({ adminToken }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Migration Complete!</h2>
        <p className="text-muted-foreground">
          Your backend has been successfully migrated from Convex to a local Express.js server.
        </p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Migration Successful!</strong> You're now using a local backend with no usage limits.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backend Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✅ Active</div>
            <p className="text-xs text-muted-foreground">
              Local Express.js server running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Limits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">∞ Unlimited</div>
            <p className="text-xs text-muted-foreground">
              No bandwidth restrictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">SQLite</div>
            <p className="text-xs text-muted-foreground">
              Local database storage
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Migration Benefits</CardTitle>
          <CardDescription>
            What you gained by migrating to the local backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">✅ No Usage Limits</Badge>
            <span className="text-sm text-muted-foreground">
              Unlimited requests and bandwidth during development
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">✅ Full Control</Badge>
            <span className="text-sm text-muted-foreground">
              Own your data and infrastructure
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">✅ Free Deployment</Badge>
            <span className="text-sm text-muted-foreground">
              Deploy to Railway, Heroku, or any cloud provider
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">✅ Better Performance</Badge>
            <span className="text-sm text-muted-foreground">
              Optimized for your specific needs
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Recommended actions after migration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <p>• <strong>Change admin credentials</strong> in <code>backend/.env</code></p>
            <p>• <strong>Test all functionality</strong> through the admin dashboard</p>
            <p>• <strong>Upload content</strong> and verify file uploads work</p>
            <p>• <strong>Deploy to production</strong> when ready (see deployment guides)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};