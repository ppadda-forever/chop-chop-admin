
"use server";

import { prisma } from "@/lib/prisma";

export async function getKpiData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const totalOrdersToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalRevenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalRevenueToday = totalRevenueResult._sum.totalAmount || 0;

    return {
      totalOrdersToday,
      totalRevenueToday,
    };
  } catch (error) {
    console.error("Error fetching KPI data with Prisma Server Action:", error);
    throw new Error("Failed to fetch KPI data.");
  }
}

export async function getOrders() {
  try {
    const fetchedOrders = await prisma.order.findMany({
      include: {
        accommodation: true, // Include related Accommodation data
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Prisma returns Date objects, which are not directly serializable in Server Actions.
    // Convert them to ISO strings or a serializable format.
    const serializableOrders = fetchedOrders.map(order => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      accommodation: {
        ...order.accommodation,
        createdAt: order.accommodation.createdAt.toISOString(),
        updatedAt: order.accommodation.updatedAt.toISOString(),
      }
    }));

    return serializableOrders;
  } catch (error) {
    console.error("Error fetching orders with Prisma Server Action:", error);
    throw new Error("Failed to fetch orders.");
  }
}
