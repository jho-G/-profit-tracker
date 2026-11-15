-- Migration: Sales Scalability & Single Restaurant Optimizations
-- Adds composite index for date-range queries on sales and database-level aggregation RPC

create index if not exists idx_sales_restaurant_sold_at
on public.sales (restaurant_id, sold_at desc);

-- Aggregation function to calculate sales summary without loading all rows into Node.js
create or replace function public.get_sales_aggregates(
  p_restaurant_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_profit numeric(12,2);
  v_total_revenue numeric(12,2);
  v_total_meals bigint;
  v_total_sales bigint;
begin
  select
    coalesce(sum(profit), 0),
    coalesce(sum(selling_price_snapshot * quantity), 0),
    coalesce(sum(quantity), 0),
    count(*)
  into
    v_total_profit,
    v_total_revenue,
    v_total_meals,
    v_total_sales
  from public.sales
  where restaurant_id = p_restaurant_id
    and (p_start_date is null or sold_at >= p_start_date)
    and (p_end_date is null or sold_at <= p_end_date);

  return json_build_object(
    'total_profit', v_total_profit,
    'total_revenue', v_total_revenue,
    'total_meals', v_total_meals,
    'total_sales', v_total_sales
  );
end;
$$;

revoke all on function public.get_sales_aggregates(uuid, timestamptz, timestamptz) from public;
grant execute on function public.get_sales_aggregates(uuid, timestamptz, timestamptz) to authenticated;
