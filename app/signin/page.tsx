import type { Metadata } from "next";
import Link from "next/link";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
    title: "Sign In | Kanny Kanban",
    description: "Access your Kanny Kanban workspace.",
};

function SigninPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-md border-border/80 shadow-md">
                <CardHeader className="gap-3 text-center">
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>
                        Sign in to pick up where you left off with your boards.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form method="post" className="space-y-5">
                        <div className="space-y-2 text-left">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-foreground"
                            >
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="space-y-2 text-left">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-foreground"
                            >
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="text-right">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full bg-primary text-primary-foreground">
                            Sign in
                        </Button>

                        <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
                            <span aria-hidden className="h-px flex-1 bg-border" />
                            or
                            <span aria-hidden className="h-px flex-1 bg-border" />
                        </div>

                        <Button type="button" variant="outline" className="w-full">
                            Continue with Google
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account? <Link href="/signup" className="text-primary hover:underline">Create one</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default SigninPage;
