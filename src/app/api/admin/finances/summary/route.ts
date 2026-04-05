import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Total revenue
    const totalRevenue = await db.revenue.aggregate({ _sum: { amount: true } })
    const totalRevenueAmount = totalRevenue._sum.amount || 0

    // Total expenses
    const totalExpenses = await db.expense.aggregate({ _sum: { amount: true } })
    const totalExpensesAmount = totalExpenses._sum.amount || 0

    // This month
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const monthRevenue = await db.revenue.aggregate({
      _sum: { amount: true },
      where: { date: { gte: firstOfMonth, lte: lastOfMonth } },
    })
    const monthExpenses = await db.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: firstOfMonth, lte: lastOfMonth } },
    })

    // Monthly breakdown (last 12 months)
    const monthlyBreakdown = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const monthName = d.toLocaleString('default', { month: 'short', year: '2-digit' })

      const mRevenue = await db.revenue.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lte: end } },
      })
      const mExpenses = await db.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lte: end } },
      })

      monthlyBreakdown.push({
        month: monthName,
        revenue: mRevenue._sum.amount || 0,
        expenses: mExpenses._sum.amount || 0,
        profit: (mRevenue._sum.amount || 0) - (mExpenses._sum.amount || 0),
      })
    }

    // Category breakdown
    const revenueByCategory = await db.revenue.groupBy({
      by: ['category'],
      _sum: { amount: true },
    })
    const expensesByCategory = await db.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
    })

    return NextResponse.json({
      totalRevenue: totalRevenueAmount,
      totalExpenses: totalExpensesAmount,
      netProfit: totalRevenueAmount - totalExpensesAmount,
      monthRevenue: monthRevenue._sum.amount || 0,
      monthExpenses: monthExpenses._sum.amount || 0,
      monthProfit: (monthRevenue._sum.amount || 0) - (monthExpenses._sum.amount || 0),
      monthlyBreakdown,
      revenueByCategory,
      expensesByCategory,
    })
  } catch (error) {
    console.error('Finance summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch finance summary' }, { status: 500 })
  }
}
