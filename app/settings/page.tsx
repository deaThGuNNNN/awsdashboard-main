"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, User, Key } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function SettingsPage() {
  const { isDark, toggleTheme, mounted } = useTheme();

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your dashboard preferences and configuration</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure general dashboard preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="refresh-interval">Auto-refresh interval (seconds)</Label>
              <Input
                id="refresh-interval"
                type="number"
                defaultValue="30"
                min="10"
                max="300"
                className="w-48"
              />
            </div>

            {mounted && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable dark theme for the dashboard
                  </div>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-view">Compact view</Label>
                <div className="text-sm text-muted-foreground">
                  Show more data in less space
                </div>
              </div>
              <Switch id="compact-view" />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="default-region">Default AWS Region</Label>
              <Input
                id="default-region"
                defaultValue="us-east-1"
                className="w-48"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive alerts via email
                </div>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cost-alerts">Cost alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Get notified when costs exceed thresholds
                </div>
              </div>
              <Switch id="cost-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="instance-alerts">Instance alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Notifications for instance state changes
                </div>
              </div>
              <Switch id="instance-alerts" />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Configure AWS API access and credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="access-key">AWS Access Key ID</Label>
              <Input
                id="access-key"
                type="password"
                placeholder="Enter your AWS Access Key ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret-key">AWS Secret Access Key</Label>
              <Input
                id="secret-key"
                type="password"
                placeholder="Enter your AWS Secret Access Key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-token">Session Token (optional)</Label>
              <Input
                id="session-token"
                type="password"
                placeholder="Enter session token if using temporary credentials"
              />
            </div>

            <div className="flex gap-2">
              <Button>Test Connection</Button>
              <Button variant="outline">Save Credentials</Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg">Save All Settings</Button>
        </div>
      </div>
    </div>
  );
} 