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

interface Order {
  id: string;
  createdAt: string; // Now a string from Server Action
  status: string;
  paymentStatus: string;
  totalAmount: number;
  paymentMethod: string;
  notes: string | null;
  accommodation: {
    name: string;
    area: string;
    createdAt: string; // Now a string from Server Action
    updatedAt: string; // Now a string from Server Action
  };
}

export function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const fetchedOrders = await getOrders();

        // The fetchedOrders are already formatted for serialization in the Server Action
        // We just need to ensure the Date objects are re-parsed for display if needed
        const formattedOrders: Order[] = fetchedOrders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt).toLocaleString(), // Convert back to display format
          accommodation: {
            ...order.accommodation,
            createdAt: new Date(order.accommodation.createdAt).toLocaleString(),
            updatedAt: new Date(order.accommodation.updatedAt).toLocaleString(),
          }
        }));

        setOrders(formattedOrders);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching orders from Server Action:", err);
        setError(err.message || "Failed to fetch orders.");
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
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
              <TableHead>합계</TableHead>
              <TableHead>결제수단</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.createdAt}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.paymentStatus}</TableCell>
                <TableCell>{`${order.accommodation.name} · ${order.accommodation.area}`}</TableCell>
                <TableCell>{`₩${order.totalAmount.toLocaleString()}`}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}