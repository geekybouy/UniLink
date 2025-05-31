import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSelect from "@/components/ThemeSelect";

const VIS_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "unilink", label: "UniLink members" },
  { value: "connections", label: "Connections only" },
  { value: "noone", label: "No one" }
];

const POST_VIS_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "unilink", label: "UniLink members" },
  { value: "onlyme", label: "Only me" }
];

const CONN_REQ_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "batchdomain", label: "Same batch/domain only" },
  { value: "noone", label: "No one" }
];

const CONTACT_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "connections", label: "Connections" },
  { value: "onlyme", label: "Only me" }
];

type PrivacySettings = {
  profile_visibility: string;
  post_visibility: string;
  connection_request_setting: string;
  contact_email_visibility: string;
  contact_phone_visibility: string;
  show_in_search: boolean;
  tagged_posts_allowed: boolean;
  read_receipts_enabled: boolean;
  location_sharing_enabled: boolean;
};

const DEFAULTS: PrivacySettings = {
  profile_visibility: "everyone",
  post_visibility: "everyone",
  connection_request_setting: "everyone",
  contact_email_visibility: "everyone",
  contact_phone_visibility: "everyone",
  show_in_search: true,
  tagged_posts_allowed: true,
  read_receipts_enabled: true,
  location_sharing_enabled: false,
};

const NewPrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (user) fetchSettings();
    // eslint-disable-next-line
  }, [user]);

  async function fetchSettings() {
    if (!user) return;
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from("user_privacy")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        toast.error("Failed to load privacy settings.");
        setLoading(false);
        return;
      }
      if (!data) {
        // Insert defaults if not exists
        const { error: insertErr, data: inserted } = await supabase
          .from("user_privacy")
          .insert({ user_id: user.id, ...DEFAULTS })
          .select("*")
          .maybeSingle();
        if (insertErr) {
          toast.error("Unable to create settings.");
          setLoading(false);
          return;
        }
        data = inserted;
      }
      setSettings({
        profile_visibility: data.profile_visibility,
        post_visibility: data.post_visibility,
        connection_request_setting: data.connection_request_setting,
        contact_email_visibility: data.contact_email_visibility,
        contact_phone_visibility: data.contact_phone_visibility,
        show_in_search: !!data.show_in_search,
        tagged_posts_allowed: !!data.tagged_posts_allowed,
        read_receipts_enabled: !!data.read_receipts_enabled,
        location_sharing_enabled: !!data.location_sharing_enabled,
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(next: Partial<PrivacySettings>) {
    if (!user) return;
    setSaving(true);
    try {
      const merged = { ...settings, ...next };
      const { error } = await supabase
        .from("user_privacy")
        .upsert({ user_id: user.id, ...merged });
      if (error) throw error;
      setSettings(merged);
      toast.success("Settings updated!");
    } catch (err: any) {
      toast.error("Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  // Individual change handlers for instant saving
  function handleChange<K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) {
    saveSettings({ [key]: value } as Partial<PrivacySettings>);
  }

  // ACCOUNT ACTIONS (deactivate/delete)
  async function handleDeactivate() {
    toast.info("Account deactivation not implemented (demo).");
    setShowDeactivate(false);
  }
  async function handleDelete() {
    toast.info("Account deletion not implemented (demo).");
    setShowDelete(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-2 py-6 md:py-10 w-full">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Privacy Settings</h1>
      <p className="text-muted-foreground mb-6 text-sm md:text-base">
        Manage visibility, controls, and privacy for your UniLink account
      </p>
      {/* Theme Selection */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Preference</CardTitle>
            <CardDescription>Choose Light, Dark, or follow your device’s System theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSelect />
          </CardContent>
        </Card>
        {/* 1. Profile Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Visibility</CardTitle>
            <CardDescription>
              Who can see your profile on UniLink.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.profile_visibility}
              onValueChange={v => handleChange("profile_visibility", v)}
              disabled={loading||saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select who can see your profile" />
              </SelectTrigger>
              <SelectContent>
                {VIS_OPTIONS.map(o =>
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        {/* 2. Post Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Post Visibility</CardTitle>
            <CardDescription>
              Who can see your posts by default.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.post_visibility}
              onValueChange={v => handleChange("post_visibility", v)}
              disabled={loading||saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select who can see your posts" />
              </SelectTrigger>
              <SelectContent>
                {POST_VIS_OPTIONS.map(o =>
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        {/* 3. Connection Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Requests</CardTitle>
            <CardDescription>
              Who can send you connection requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.connection_request_setting}
              onValueChange={v => handleChange("connection_request_setting", v)}
              disabled={loading||saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select who can request a connection" />
              </SelectTrigger>
              <SelectContent>
                {CONN_REQ_OPTIONS.map(o =>
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        {/* 4. Contact Info Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Info Visibility</CardTitle>
            <CardDescription>
              Control who can see your contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <span className="font-medium text-sm">Email Visibility</span>
                <Select
                  value={settings.contact_email_visibility}
                  onValueChange={v => handleChange("contact_email_visibility", v)}
                  disabled={loading||saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_OPTIONS.map(o =>
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <span className="font-medium text-sm">Phone Visibility</span>
                <Select
                  value={settings.contact_phone_visibility}
                  onValueChange={v => handleChange("contact_phone_visibility", v)}
                  disabled={loading||saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_OPTIONS.map(o =>
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* 5. Search Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Search Privacy</CardTitle>
            <CardDescription>
              Control whether your profile is searchable by others.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Switch
                checked={!!settings.show_in_search}
                onCheckedChange={v => handleChange("show_in_search", v)}
                disabled={loading||saving}
              />
              <span>
                {settings.show_in_search ? "Profile visible in search" : "Hide from search results"}
              </span>
            </div>
          </CardContent>
        </Card>
        {/* 6. Tagged Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Tagged Posts</CardTitle>
            <CardDescription>
              Allow others to tag you in posts and discussions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Switch
                checked={!!settings.tagged_posts_allowed}
                onCheckedChange={v => handleChange("tagged_posts_allowed", v)}
                disabled={loading||saving}
              />
              <span>
                {settings.tagged_posts_allowed ? "Allow tagging" : "Disallow tagging"}
              </span>
            </div>
          </CardContent>
        </Card>
        {/* 7. Read Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>Read Receipts</CardTitle>
            <CardDescription>
              Whether your message read receipts are visible to others.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Switch
                checked={!!settings.read_receipts_enabled}
                onCheckedChange={v => handleChange("read_receipts_enabled", v)}
                disabled={loading||saving}
              />
              <span>
                {settings.read_receipts_enabled ? "Show read receipts" : "Hide read receipts"}
              </span>
            </div>
          </CardContent>
        </Card>
        {/* 8. Location Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>Location Sharing</CardTitle>
            <CardDescription>
              Allow others to see your current location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Switch
                checked={!!settings.location_sharing_enabled}
                onCheckedChange={v => handleChange("location_sharing_enabled", v)}
                disabled={loading||saving}
              />
              <span>
                {settings.location_sharing_enabled ? "Location sharing enabled" : "Location hidden"}
              </span>
            </div>
          </CardContent>
        </Card>
        {/* 9. Account Control */}
        <Card>
          <CardHeader>
            <CardTitle>Account Control</CardTitle>
            <CardDescription>
              Deactivate or permanently delete your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Dialog open={showDeactivate} onOpenChange={setShowDeactivate}>
                <DialogTrigger asChild>
                  <Button variant="warning" onClick={() => setShowDeactivate(true)}>
                    Deactivate Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deactivate Account</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    This will temporarily disable your account. You can reactivate by logging in again.<br />
                    Are you sure you want to deactivate?
                  </DialogDescription>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeactivate(false)}>Cancel</Button>
                    <Button variant="warning" onClick={handleDeactivate}>Deactivate</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogTrigger asChild>
                  <Button variant="destructive" onClick={() => setShowDelete(true)}>
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    WARNING: This will permanently delete all your data and cannot be undone.<br />
                    Are you sure you want to delete your UniLink account?
                  </DialogDescription>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete Account</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              For security, account action buttons will require additional authentication.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewPrivacySettings;
