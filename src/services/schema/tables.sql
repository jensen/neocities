drop table if exists owners cascade;
drop table if exists hoods cascade;
drop table if exists games cascade;

create table users (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  provider_id text unique not null,
  email text not null
);

create table owners (
  id uuid references users primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  username text not null,
  avatar text
);

drop function if exists add_new_user(_provider_id text, _email text, _username text, _avatar text);
create function add_new_user(_provider_id text, _email text, _username text, _avatar text)
returns uuid
as $$
declare
  user_id uuid;
begin

  insert into
  users (provider_id, email)
  values (_provider_id, _email)
  on conflict (provider_id)
  do update set
    email = _email
  where users.provider_id = _provider_id returning id into user_id;

  insert into owners (id, username, avatar)
  values (user_id, _username, _avatar)
  on conflict (id)
  do update set
    username = _username,
    avatar = _avatar
  where owners.id = user_id;

  return user_id;
end;
$$ language plpgsql;

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

  number integer not null,

  hood_id uuid not null,
  constraint hood_id foreign key(hood_id) references hoods(id) on delete cascade,

  owner_id uuid,
  constraint owner_id foreign key(owner_id) references owners(id) on delete cascade
);
