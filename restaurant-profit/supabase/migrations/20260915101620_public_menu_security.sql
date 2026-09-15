-- Public QR menus expose a deliberately narrow, read-only projection.
-- Keep the base tables private except for the exact source columns needed by
-- the security-invoker view and its anonymous SELECT policies.

revoke all on table public.restaurants from anon;
revoke all on table public.products from anon;
revoke all on table public.profiles from anon;
revoke all on table public.sales from anon;
revoke all on table public.product_price_history from anon;

grant select (id, name)
on table public.restaurants
to anon;

grant select (
	id,
	restaurant_id,
	name,
	selling_price,
	active,
	category,
	description,
	image_url
)
on table public.products
to anon;

create policy "Public can view restaurant identity for menus"
on public.restaurants
for select
to anon
using (true);

create policy "Public can view active products for menus"
on public.products
for select
to anon
using (active is true);

create view public.public_menu_items
with (security_invoker = true)
as
select
	r.id as restaurant_id,
	r.name as restaurant_name,
	p.id as product_id,
	p.name as product_name,
	p.selling_price,
	p.category,
	p.description,
	p.image_url
from public.restaurants as r
join public.products as p
	on p.restaurant_id = r.id
where p.active is true;

revoke all on table public.public_menu_items from public, anon, authenticated;
grant select on table public.public_menu_items to anon;
