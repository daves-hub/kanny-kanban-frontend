"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export default function SettingsPage() {
  const { user, signout } = useAuth();

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account and workspace preferences.</p>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <Card className="border border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="text-base font-medium text-gray-900">
                  {user?.name ? `${user.name} · ${user.email}` : user?.email}
                </p>
              </div>
              <Button variant="destructive" onClick={signout}>
                Sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
