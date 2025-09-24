
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getKpiData } from "../app/actions";

interface KpiItem {
  title: string;
  value: string;
  description: string;
}

export function KpiCard() {
  const [kpiData, setKpiData] = useState<KpiItem[]>([
    { title: "오늘 주문 수", value: "-", description: "금일 발생한 총 주문 건수" },
    { title: "오늘 매출 합계", value: "-", description: "금일 발생한 총 매출액" },
    { title: "평균 처리시간", value: "41m", description: "주문 접수부터 배달 완료까지 평균 소요 시간" },
    { title: "전체 전환율", value: "12.5%", description: "QR 스캔 대비 최종 배달 완료 비율" },
  ]);

  useEffect(() => {
    async function fetchKpi() {
      try {
        const { totalOrdersToday, totalRevenueToday } = await getKpiData();

        setKpiData((prevData) =>
          prevData.map((item) => {
            if (item.title === "오늘 주문 수") {
              return { ...item, value: totalOrdersToday.toString() };
            } else if (item.title === "오늘 매출 합계") {
              return { ...item, value: `₩${totalRevenueToday.toLocaleString()}` };
            }
            return item;
          })
        );
      } catch (error) {
        console.error("Error fetching KPI data from Server Action:", error);
        // Optionally, set an error state to display in the UI
      }
    }

    fetchKpi();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {kpi.title}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
