
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
    { title: "평균 처리시간", value: "- 분", description: "주문 접수부터 배달 완료까지 평균 소요 시간" },
    { title: "전환율 (장바구니/주문)", value: "- % / - %", description: "QR 스캔 대비 장바구니 추가 및 주문 완료 비율" },
  ]);

  useEffect(() => {
    async function fetchKpi() {
      try {
        const { 
          totalOrdersToday, 
          totalRevenueToday, 
          avgProcessingTimeInMinutes, 
          cartConversionRate, 
          orderConversionRate 
        } = await getKpiData();

        setKpiData((prevData) =>
          prevData.map((item) => {
            if (item.title === "오늘 주문 수") {
              return { ...item, value: totalOrdersToday.toString() };
            } else if (item.title === "오늘 매출 합계") {
              return { ...item, value: `₩${totalRevenueToday.toLocaleString()}` };
            } else if (item.title === "평균 처리시간") {
              return { ...item, value: `${avgProcessingTimeInMinutes}분` };
            } else if (item.title === "전환율 (장바구니/주문)") {
              return { ...item, value: `${cartConversionRate.toFixed(1)}% / ${orderConversionRate.toFixed(1)}%` };
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
