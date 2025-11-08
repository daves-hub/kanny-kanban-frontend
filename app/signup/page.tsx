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
    title: "Create Account | Kanny Kanban",
    description: "Sign up to start organizing work in Kanny Kanban.",
};

function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-md border-border/80 shadow-md">
                <CardHeader className="gap-3 text-center">
                    <CardTitle className="text-2xl">Create your account</CardTitle>
                    <CardDescription>
                        Join Kanny Kanban to start planning and tracking your work.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form method="post" className="space-y-5">
                        <div className="space-y-2 text-left">
                            <label
                                htmlFor="name"
                                className="text-sm font-medium text-foreground"
                            >
                                Full name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Jane Doe"
                                autoComplete="name"
                                required
                            />
                        </div>

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
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="space-y-2 text-left">
                            <label
                                htmlFor="confirm-password"
                                className="text-sm font-medium text-foreground"
                            >
                                Confirm password
                            </label>
                            <Input
                                id="confirm-password"
                                type="password"
                                name="confirmPassword"
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Create account
                        </Button>

                        <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
                            <span aria-hidden className="h-px flex-1 bg-border" />
                            or
                            <span aria-hidden className="h-px flex-1 bg-border" />
                        </div>

                        <Button type="button" variant="outline" className="w-full">
                            Sign up with Google
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Already have an account? <Link href="/signin" className="text-primary hover:underline">Sign in</Link>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        By creating an account you agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default SignupPage;