import { KpiCard } from "@/components/kpi-card";
import { OrderTable } from "@/components/order-table";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-2xl font-bold">Chop-Chop 어드민 대시보드</h1>
        <KpiCard />
        <div className="grid gap-4">
          <OrderTable />
        </div>
      </main>
    </div>
  );
}