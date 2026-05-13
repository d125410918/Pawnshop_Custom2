create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  national_id text not null,
  city text not null,
  district text,
  income_type text not null default 'monthly',
  income_amount numeric,
  income_label text,
  collateral text,
  funding_need text,
  status text not null default 'pending',
  selfie_url text,
  id_card_front_url text,
  id_card_back_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_created_at_idx on customers (created_at desc);
create index if not exists customers_status_idx on customers (status);
