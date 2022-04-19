drop table if exists hoods cascade;
drop table if exists games cascade;

create table hoods (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  name text not null,
  description text not null
);

create table addresses (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  

  hood_id uuid not null,
  constraint hood_id foreign key(hood_id) references hoods(id) on delete cascade
);