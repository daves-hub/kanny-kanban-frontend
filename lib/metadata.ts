import type { Metadata } from "next";

export const SITE_METADATA: Metadata = {
  title: "Kanny Kanban | A Zkyte Fullstack Task",
  description: "A Kanban board built with Next.js and TypeScript",
  authors: [{ name: "Ighalo Genesis Osasenaga", url: "https://daves-hub.vercel.app" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const PAGE_TITLES = {
  dashboard: "Workspace — Kanny Kanban",
  projects: "Projects — Kanny Kanban",
  projectDetail: (name: string) => `${name} — Project · Kanny Kanban`,
  board: (name?: string) => name ? `${name} — Board · Kanny Kanban` : "Board — Kanny Kanban",
  signin: "Sign in — Kanny Kanban",
  signup: "Sign up — Kanny Kanban",
  forgotPassword: "Forgot password — Kanny Kanban",
  settings: "Settings — Kanny Kanban",
} as const;

export const PAGE_DESCRIPTIONS = {
  dashboard: "Overview of your projects and boards",
  projects: "Manage and browse your projects",
  projectDetail: (name: string) => `Boards and progress for ${name}`,
  board: (name?: string) => name ? `${name} kanban tasks and workflow` : "Your kanban board",
  signin: "Sign in to your Kanny Kanban account",
  signup: "Create a Kanny Kanban account",
  forgotPassword: "Placeholder flow for resetting your Kanny Kanban password",
  settings: "Manage account and workspace settings",
} as const;
