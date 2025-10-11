"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const username = formData.get('username')
  const password = formData.get('password')

  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  if (username === adminUsername && password === adminPassword) {
    // Set a session cookie
    (await cookies()).set('session', 'loggedin', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    redirect('/')
  } else {
    redirect('/login?error=Invalid ID or Password')
  }
}

export async function logout() {
  (await cookies()).delete('session')
  redirect('/login')
}

export async function getKpiData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    // 1. 오늘 주문 수 및 매출
    const totalOrdersToday = await prisma.order.count({
      where: { createdAt: { gte: today, lt: tomorrow } },
    });

    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { createdAt: { gte: today, lt: tomorrow } },
    });
    const totalRevenueToday = totalRevenueResult._sum.totalAmount || 0;

    // 2. 평균 처리 시간 (주문 완료 기준)
    const deliveredOrders = await prisma.order.findMany({
      where: { status: 'DELIVERED' },
      select: { createdAt: true, updatedAt: true },
    });

    let avgProcessingTimeInMinutes = 0;
    if (deliveredOrders.length > 0) {
      const totalProcessingTime = deliveredOrders.reduce((acc, order) => {
        const processingTime = order.updatedAt.getTime() - order.createdAt.getTime();
        return acc + processingTime;
      }, 0);
      avgProcessingTimeInMinutes = Math.round(totalProcessingTime / deliveredOrders.length / (1000 * 60));
    }

    // 3. 전환율 계산
    const qrEntrySessions = await prisma.analytics.findMany({
      where: { eventType: 'QR_ENTRY' },
      select: { sessionId: true },
      distinct: ['sessionId'],
    });
    const qrEntrySessionIds = qrEntrySessions.map(e => e.sessionId);

    let cartConversionRate = 0;
    let orderConversionRate = 0;

    if (qrEntrySessionIds.length > 0) {
      const cartAddGroups = await prisma.analytics.groupBy({
        by: ['sessionId'],
        where: {
          sessionId: { in: qrEntrySessionIds },
          eventType: 'CART_ADD_ITEM',
        },
      });
      const cartAddSessionCount = cartAddGroups.length;

      const orderCompleteGroups = await prisma.analytics.groupBy({
        by: ['sessionId'],
        where: {
          sessionId: { in: qrEntrySessionIds },
          eventType: 'ORDER_COMPLETE',
        },
      });
      const orderCompleteSessionCount = orderCompleteGroups.length;
      
      cartConversionRate = (cartAddSessionCount / qrEntrySessionIds.length) * 100;
      orderConversionRate = (orderCompleteSessionCount / qrEntrySessionIds.length) * 100;
    }

    return {
      totalOrdersToday,
      totalRevenueToday,
      avgProcessingTimeInMinutes,
      cartConversionRate,
      orderConversionRate,
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
        orderItems: {
          include: {
            menuItem: {
              include: {
                restaurant: true,
              },
            },
          },
        },
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
      },
      orderItems: order.orderItems.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        menuItem: {
          ...item.menuItem,
          createdAt: item.menuItem.createdAt.toISOString(),
          updatedAt: item.menuItem.updatedAt.toISOString(),
          restaurant: {
            ...item.menuItem.restaurant,
            createdAt: item.menuItem.restaurant.createdAt.toISOString(),
            updatedAt: item.menuItem.restaurant.updatedAt.toISOString(),
          }
        }
      }))
    }));

    return serializableOrders;
  } catch (error) {
    console.error("Error fetching orders with Prisma Server Action:", error);
    throw new Error("Failed to fetch orders.");
  }
}

import { revalidatePath } from "next/cache";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    // Optional: Add validation to ensure newStatus is a valid OrderStatus
    const validStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // Revalidate the page to show the updated status
    revalidatePath('/');

  } catch (error) {
    console.error(`Error updating order status for order ${orderId}:`, error);
    // Re-throw the error to be caught by the client-side caller if needed
    throw new Error("Failed to update order status.");
  }
}