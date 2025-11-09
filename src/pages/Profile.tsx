import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Upload, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    photo: null as File | null,
    photo_url: "",
    theme_preference: "auto",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authApi.getProfile();
      setProfile({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        bio: data.bio || "",
        photo: null,
        photo_url: data.photo || "",
        theme_preference: data.theme_preference || "auto",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await authApi.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio,
        photo: profile.photo || undefined,
        theme_preference: profile.theme_preference,
      });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      await loadProfile(); // Reload to get updated photo URL
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile({ ...profile, photo: file });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your profile information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Photo Upload */}
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">Profile Photo</Label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile.photo_url || profile.photo ? (
                  <img
                    src={
                      profile.photo
                        ? URL.createObjectURL(profile.photo)
                        : profile.photo_url
                    }
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {profile.photo ? "Change Photo" : "Upload Photo"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max size 2MB
                </p>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">Personal Information</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profile.first_name}
                  onChange={(e) =>
                    setProfile({ ...profile, first_name: e.target.value })
                  }
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profile.last_name}
                  onChange={(e) =>
                    setProfile({ ...profile, last_name: e.target.value })
                  }
                  placeholder="Doe"
                />
              </div>
            </div>
          </Card>

          {/* Bio */}
          <Card className="p-6">
            <Label htmlFor="bio" className="text-lg font-semibold mb-4 block">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={6}
            />
          </Card>

          {/* Theme Preference */}
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">Theme Preference</Label>
            <div className="space-y-2">
              <select
                value={profile.theme_preference}
                onChange={(e) =>
                  setProfile({ ...profile, theme_preference: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme. "Auto" follows your system settings.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;

