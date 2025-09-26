import { getOrders, logout } from "@/app/actions";
import { KpiCard } from "@/components/kpi-card";
import { OrderTable } from "@/components/order-table";

export default async function Dashboard() {
  const orders = await getOrders();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Chop-Chop 어드민 대시보드</h1>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
            >
              Logout
            </button>
          </form>
        </div>
        <KpiCard />
        <div className="grid gap-4">
          <OrderTable orders={orders} />
        </div>
      </main>
    </div>
  );
}