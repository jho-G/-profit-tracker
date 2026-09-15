# Live Supabase Public QR Menu Inspection

**Inspection date:** 2026-09-15  
**Mode:** Read-only  
**Project:** Existing linked Supabase project configured by the repository

No database objects, privileges, policies, application files, or security settings were changed during this inspection.

## 1. PostgreSQL Version

Live PostgreSQL version:

```text
17.6
```

`security_invoker` views are supported on this PostgreSQL version.

## 2. Current Anonymous Privileges

The live `anon` role currently has no table-level privileges on any requested table:

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---:|---:|---:|---:|
| `public.restaurants` | no | no | no | no |
| `public.products` | no | no | no | no |
| `public.profiles` | no | no | no | no |
| `public.sales` | no | no | no | no |
| `public.product_price_history` | no | no | no | no |

The `public` schema itself is usable by `anon`, but table access is denied. This explains the observed `42501` error from the current public route:

```text
permission denied for table restaurants
```

The failure occurs at the PostgreSQL privilege check before an RLS policy could allow or filter rows.

A column-level privilege check also found no anonymous `SELECT`, `INSERT`, or `UPDATE` privileges on any column of `restaurants` or `products`. In particular, `anon` currently has no column-level access to `cost_price` or any other product field.

## 3. Current RLS Status

RLS is enabled and not forced on all requested tables:

| Table | RLS enabled | RLS forced |
|---|---:|---:|
| `public.restaurants` | yes | no |
| `public.products` | yes | no |
| `public.profiles` | yes | no |
| `public.sales` | yes | no |
| `public.product_price_history` | yes | no |

## 4. Current RLS Policies

### `public.restaurants`

| Policy | Command | Roles | USING | WITH CHECK |
|---|---|---|---|---|
| `Owners can view their restaurant` | SELECT | `authenticated` | `id = private.user_restaurant_id()` | none |

There is no existing anonymous/public restaurant policy.

### `public.products`

| Policy | Command | Roles | USING | WITH CHECK |
|---|---|---|---|---|
| `Owners can create restaurant products` | INSERT | `authenticated` | none | `restaurant_id = private.user_restaurant_id()` |
| `Owners can delete restaurant products` | DELETE | `authenticated` | `restaurant_id = private.user_restaurant_id()` | none |
| `Owners can update restaurant products` | UPDATE | `authenticated` | `restaurant_id = private.user_restaurant_id()` | `restaurant_id = private.user_restaurant_id()` |
| `Owners can view restaurant products` | SELECT | `authenticated` | `restaurant_id = private.user_restaurant_id()` | none |

There is no existing anonymous product policy. The current product policy is owner-scoped and does not include `active = true` as a public condition.

### `public.profiles`

| Policy | Command | Roles | USING | WITH CHECK |
|---|---|---|---|---|
| `Owners can update their profile` | UPDATE | `authenticated` | `id = auth.uid()` | `id = auth.uid()` |
| `Owners can view their profile` | SELECT | `authenticated` | `id = auth.uid()` | none |

There are no anonymous profile policies.

### `public.sales`

| Policy | Command | Roles | USING | WITH CHECK |
|---|---|---|---|---|
| `Owners can create restaurant sales` | INSERT | `authenticated` | none | Restaurant matches `private.user_restaurant_id()`, `created_by = auth.uid()`, and the referenced product belongs to that restaurant |
| `Owners can delete restaurant sales` | DELETE | `authenticated` | `restaurant_id = private.user_restaurant_id()` | none |
| `Owners can update restaurant sales` | UPDATE | `authenticated` | `restaurant_id = private.user_restaurant_id()` | Restaurant matches `private.user_restaurant_id()` and the referenced product belongs to that restaurant |
| `Owners can view restaurant sales` | SELECT | `authenticated` | `restaurant_id = private.user_restaurant_id()` | none |

There are no anonymous sales policies.

### `public.product_price_history`

| Policy | Command | Roles | USING | WITH CHECK |
|---|---|---|---|---|
| `Owners can create price history` | INSERT | `authenticated` | none | `changed_by = auth.uid()` and the product belongs to `private.user_restaurant_id()` |
| `Owners can delete price history` | DELETE | `authenticated` | The referenced product belongs to `private.user_restaurant_id()` | none |
| `Owners can update price history` | UPDATE | `authenticated` | The referenced product belongs to `private.user_restaurant_id()` | The referenced product belongs to `private.user_restaurant_id()` |
| `Owners can view price history` | SELECT | `authenticated` | The referenced product belongs to `private.user_restaurant_id()` | none |

There are no anonymous price-history policies.

## 5. Existing Views and Functions

### Relevant views

No application-relevant views exist in `public`, `api`, or `private`.

The database contains extension-owned views such as `extensions.pg_stat_statements`; these are unrelated to menu access and must not be used for this feature.

### Relevant functions

The only application-relevant function found is:

```text
private.user_restaurant_id() returns uuid
security definer: yes
execute granted to: authenticated
```

It is an owner-authentication helper used by existing RLS policies. It is not an anonymous public-menu function and should not be reused for customer access.

No existing public or API-schema RPC function can provide the public menu.

## 6. Live Schema

### `public.restaurants`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| `id` | `uuid` | no | `gen_random_uuid()` |
| `name` | `text` | no | none |
| `created_at` | `timestamp with time zone` | yes | `now()` |

There is no public slug or public menu token column.

### `public.products`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| `id` | `uuid` | no | `gen_random_uuid()` |
| `restaurant_id` | `uuid` | yes | none |
| `name` | `text` | no | none |
| `cost_price` | `numeric` | no | none |
| `selling_price` | `numeric` | no | none |
| `created_at` | `timestamp with time zone` | yes | `now()` |
| `description` | `text` | yes | none |
| `category` | `text` | yes | none |
| `image_url` | `text` | yes | none |
| `active` | `boolean` | no | `true` |
| `updated_at` | `timestamp with time zone` | no | `now()` |

### Relationships

The relevant live foreign keys are:

```text
products.restaurant_id -> restaurants.id
profiles.restaurant_id -> restaurants.id
sales.restaurant_id -> restaurants.id
sales.product_id -> products.id
product_price_history.product_id -> products.id
```

The `products.restaurant_id` column is nullable, so the proposed view must use an inner join to `restaurants` and naturally exclude orphaned products.

## 7. Recommended Architecture

A dedicated view remains viable and is recommended:

```text
public.public_menu_items
```

The view should expose only:

```text
restaurant_id
restaurant_name
product_id
product_name
selling_price
category
description
image_url
```

It should join `restaurants` to `products` and include only:

```text
products.active = true
```

It must never select or expose:

```text
cost_price
profit
sales
price history
created_by
profiles
owner information
```

The view should be created with:

```sql
WITH (security_invoker = true)
```

PostgreSQL 17.6 supports this option.

## 8. Exact Proposed Database Changes

These are design requirements only. None were executed.

### A. Create the view

Create `public.public_menu_items` as a projection joining:

```text
public.restaurants r
public.products p
```

Join condition:

```text
p.restaurant_id = r.id
```

Filter:

```text
p.active = true
```

Projection:

```text
r.id          as restaurant_id
r.name        as restaurant_name
p.id          as product_id
p.name        as product_name
p.selling_price
p.category
p.description
p.image_url
```

Use `security_invoker = true`.

### B. Grant only required underlying columns to `anon`

Because an invoker view evaluates privileges as the calling role, `anon` must have access to the underlying columns used by the view. The proposed column-level grants are:

```sql
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
```

Do not grant `cost_price` or unrelated private columns to `anon`.

This means anonymous clients could technically query those approved public columns directly from the base tables. If that direct exposure is unacceptable, use Option B below instead.

### C. Add narrowly scoped anonymous SELECT policies

Add an `anon` SELECT policy on `restaurants` that allows only the public restaurant identity needed by the menu.

Add an `anon` SELECT policy on `products` that allows only rows where:

```sql
active = true
```

These policies should be SELECT-only. No anonymous INSERT, UPDATE, or DELETE policies should be added.

Because public menus are intentionally public, the row condition may allow all restaurants' public identity and active public products. The application route must still filter the view by one restaurant ID.

### D. Create and grant the view

The view should have no write grants:

```sql
revoke all on table public.public_menu_items from public, anon, authenticated;
grant select on table public.public_menu_items to anon;
```

If the deployment treats `public` and `anon` grants separately, both should be explicitly revoked before granting only the required `anon` SELECT privilege.

### E. Preserve private table protections

Confirm that `anon` remains unable to access:

```text
profiles
sales
product_price_history
```

No anonymous grants or policies should be added for those tables.

### F. Add database tests

The migration should include tests proving that:

- `anon` can read the view.
- Only active products appear.
- `cost_price` cannot be selected from the view.
- `cost_price` is not granted to `anon` on `products`.
- `anon` cannot read profiles, sales, or price history.
- `anon` cannot insert, update, or delete.
- Products are joined to the correct restaurant.
- An inactive product never appears.

## 9. Security Analysis

### Is the invoker view viable with the current state?

Not immediately.

The current state has:

- no `anon` SELECT privilege on `restaurants` or `products`;
- no `anon` RLS policy on either table;
- owner-only authenticated policies.

Therefore, an invoker view would also fail today. Granting SELECT on the view alone would not be enough because `security_invoker` evaluates the underlying table access as `anon`.

It becomes viable after adding:

1. column-level SELECT grants for only the view’s source columns;
2. public SELECT policies limited to intended public rows;
3. a `security_invoker` view with an explicit public projection;
4. explicit SELECT-only access to the view.

### When would a SECURITY DEFINER function be needed?

A `SECURITY DEFINER` RPC would be needed only if the requirement is that `anon` must have no underlying table privileges at all.

That alternative would require a tightly hardened function, likely in a private/non-exposed schema or controlled API schema, with:

- fixed `search_path`;
- schema-qualified references;
- explicit return columns;
- active-product filtering;
- exact restaurant scoping;
- explicit execute grants;
- `REVOKE EXECUTE FROM PUBLIC`;
- tests for cross-restaurant and private-column leakage.

It is more complex and more sensitive because a security-definer function can bypass RLS. It is not required for the recommended invoker-view design.

## 10. QR Identifier

The live `restaurants.id` is a UUID, and there is no slug/token column.

For the current version, use:

```text
/menu/{restaurantId}
```

The UUID is an identifier, not a secret. Security must come from the database projection, grants, and RLS, not from UUID secrecy.

A future random public token could be added if URL enumeration becomes a concern, but that would require a schema migration and would not replace RLS or column-level protection.

## 11. Application Changes After Approval

No application changes were made during this inspection.

After the database design is approved:

- [app/menu/[restaurantId]/page.tsx](app/menu/[restaurantId]/page.tsx) should query only `public.public_menu_items`.
- It should filter by `restaurant_id` and render only the view fields.
- It should not query `restaurants` or `products` directly for public requests.
- [app/dashboard/page.tsx](app/dashboard/page.tsx) can continue generating the QR URL using the restaurant UUID.
- Owner dashboard queries remain unchanged and continue using authenticated RLS policies.

## Final Conclusion

The live database confirms that the public QR menu is blocked because `anon` has no privileges or policies for `restaurants` and `products`, not because the route needs a service-role workaround.

The recommended secure path is:

```text
column-limited anon grants
+ narrowly scoped anon SELECT policies
+ security_invoker public_menu_items view
+ view-only public route query
```

No database or application changes should be made until this architecture is approved.
