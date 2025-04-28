import type { Metadata } from "next"
import { ProfileForm } from "@/components/profile/profile-form"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { SecuritySettings } from "@/components/profile/security-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"

export const metadata: Metadata = {
  title: "Profile | Trading Journal",
  description: "Manage your trading journal profile and account settings",
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <AvatarUpload />
                <ProfileForm />
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <h2 className="text-xl font-semibold">Account Management</h2>
                  <p className="text-sm text-muted-foreground">
                    This section is coming soon. You'll be able to manage your subscription, billing, and account
                    details.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <SecuritySettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
