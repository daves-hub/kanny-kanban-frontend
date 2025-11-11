import Link from "next/link";
import type { Metadata } from "next";
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from "@/lib/metadata";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: PAGE_TITLES.forgotPassword,
  description: PAGE_DESCRIPTIONS.forgotPassword,
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md border-border/80 shadow-md">
        <CardHeader className="gap-3 text-center">
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            Enter the email linked to your workspace and we&apos;ll send reset instructions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" aria-label="Forgot password form">
            <div className="space-y-2 text-left">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled
              />
            </div>

            <Button type="button" className="w-full" disabled>
              Reset link coming soon
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              This page is a placeholder while the password recovery flow is built.
            </p>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link href="/signin" className="text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
