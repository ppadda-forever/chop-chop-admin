"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrders } from "../app/actions";
import { StatusSelector } from "./status-selector";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: string;
  totalAmount: number;
  paymentMethod: string;
  notes: string | null;
  accommodation: {
    name: string;
    area: string;
  };
  orderItems: {
    menuItem: {
      restaurant: {
        name: string;
      };
    };
  }[];
}

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  // The component now receives orders directly as a prop.
  // No need for internal state for loading, error, or the orders themselves.

  const statusColorMap: { [key in OrderStatus]: string } = {
    PENDING: "bg-orange-100",
    CONFIRMED: "bg-blue-100",
    DELIVERED: "bg-green-100",
    CANCELLED: "bg-gray-100",
  };

  if (!orders) {
    return <p>No orders to display.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 주문</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>주문 시각</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>결제 상태</TableHead>
              <TableHead>숙소</TableHead>
              <TableHead>가게 이름</TableHead>
              <TableHead>합계</TableHead>
              <TableHead>결제수단</TableHead>
              <TableHead>메모</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className={statusColorMap[order.status]}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <StatusSelector orderId={order.id} currentStatus={order.status} />
                </TableCell>
                <TableCell>{order.paymentStatus}</TableCell>
                <TableCell>{order.accommodation.name}</TableCell>
                <TableCell>
                  {order.orderItems[0]?.menuItem.restaurant.name || '-'}
                </TableCell>
                <TableCell>{`₩${order.totalAmount.toLocaleString()}`}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>{order.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}