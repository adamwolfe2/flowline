-- Flowline Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase Auth)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  stripe_customer_id text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  created_at timestamptz not null default now()
);

-- Funnels table
create table public.funnels (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  slug text unique not null,
  custom_domain text unique,
  config jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leads table
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  email text not null,
  answers jsonb not null default '{}'::jsonb,
  score integer not null default 0,
  calendar_tier text not null check (calendar_tier in ('high', 'mid', 'low')),
  created_at timestamptz not null default now()
);

-- Funnel sessions table
create table public.funnel_sessions (
  id uuid primary key default uuid_generate_v4(),
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed boolean not null default false,
  converted boolean not null default false
);

-- Domain verifications table
create table public.domain_verifications (
  id uuid primary key default uuid_generate_v4(),
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  domain text not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'failed')),
  vercel_domain_id text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_funnels_user_id on public.funnels(user_id);
create index idx_funnels_slug on public.funnels(slug);
create index idx_funnels_custom_domain on public.funnels(custom_domain);
create index idx_leads_funnel_id on public.leads(funnel_id);
create index idx_leads_created_at on public.leads(created_at);
create index idx_sessions_funnel_id on public.funnel_sessions(funnel_id);

-- RLS Policies
alter table public.users enable row level security;
alter table public.funnels enable row level security;
alter table public.leads enable row level security;
alter table public.funnel_sessions enable row level security;

-- Users can only read/update their own row
create policy "Users can read own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

-- Funnels: users can CRUD their own funnels
create policy "Users can read own funnels" on public.funnels for select using (auth.uid() = user_id);
create policy "Users can insert own funnels" on public.funnels for insert with check (auth.uid() = user_id);
create policy "Users can update own funnels" on public.funnels for update using (auth.uid() = user_id);
create policy "Users can delete own funnels" on public.funnels for delete using (auth.uid() = user_id);
-- Public can read published funnels (for the renderer)
create policy "Public can read published funnels" on public.funnels for select using (published = true);

-- Leads: funnel owners can read, public can insert
create policy "Funnel owners can read leads" on public.leads for select using (
  exists (select 1 from public.funnels where funnels.id = leads.funnel_id and funnels.user_id = auth.uid())
);
create policy "Public can insert leads" on public.leads for insert with check (true);

-- Sessions: funnel owners can read, public can insert
create policy "Funnel owners can read sessions" on public.funnel_sessions for select using (
  exists (select 1 from public.funnels where funnels.id = funnel_sessions.funnel_id and funnels.user_id = auth.uid())
);
create policy "Public can insert sessions" on public.funnel_sessions for insert with check (true);
