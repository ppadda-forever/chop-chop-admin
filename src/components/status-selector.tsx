"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

interface StatusSelectorProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function StatusSelector({ orderId, currentStatus }: StatusSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as OrderStatus;
    setError(null);

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
      } catch (err) {
        setError("Failed to update status. Please try again.");
        // Revert optimistic update if any, though here we rely on revalidation
      }
    });
  };

  return (
    <div className="flex flex-col">
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          isPending ? "cursor-not-allowed bg-gray-200" : "bg-white"
        }`}
      >
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
