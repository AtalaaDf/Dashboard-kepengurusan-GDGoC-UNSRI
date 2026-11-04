import React, { useMemo } from 'react';
import type { KasSubmission, KasExpense, Member } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';

interface CashHistorySectionProps {
  submissions: KasSubmission[];
  expenses: KasExpense[];
  getMemberById: (id: string) => Member | undefined;
}

interface CashTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  title: string;
  subtitle: string;
  amount: number;
}

export const CashHistorySection: React.FC<CashHistorySectionProps> = ({
  submissions,
  expenses,
  getMemberById,
}) => {
  const transactions: CashTransaction[] = useMemo(() => {
    const incomeItems: CashTransaction[] = submissions
      .filter((s) => s.status === 'approved')
      .map((s) => {
        const member = getMemberById(s.member_id);
        return {
          id: s.id,
          date: s.reviewed_at || s.submitted_at,
          type: 'income',
          title: `Pembayaran Kas - ${member?.full_name || 'Member'}`,
          subtitle: 'Iuran kas & denda diterima',
          amount: s.total_amount,
        };
      });

    const expenseItems: CashTransaction[] = expenses.map((e) => ({
      id: e.id,
      date: e.expense_date,
      type: 'expense',
      title: e.description,
      subtitle: 'Pengeluaran kas organisasi',
      amount: e.amount,
    }));

    return [...incomeItems, ...expenseItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [submissions, expenses, getMemberById]);

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center border border-[#1e1e1e]/10 rounded-2xl bg-white text-[#1e1e1e]/60 text-sm">
        Belum ada riwayat transaksi kas yang tercatat.
      </div>
    );
  }

  return (
    <div className="border border-[#1e1e1e]/10 rounded-2xl overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]/10 bg-[#f0f0f0]/50 text-[#1e1e1e]/70 font-medium">
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Jenis</th>
              <th className="py-3 px-4">Keterangan</th>
              <th className="py-3 px-4 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]/10">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#f0f0f0]/30 transition-colors">
                <td className="py-3 px-4 text-xs text-[#1e1e1e]/60 whitespace-nowrap">
                  {formatDate(tx.date)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Badge variant={tx.type === 'income' ? 'success' : 'danger'}>
                    {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-[#1e1e1e]">{tx.title}</p>
                  <p className="text-xs text-[#1e1e1e]/50">{tx.subtitle}</p>
                </td>
                <td
                  className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${
                    tx.type === 'income' ? 'text-[#34a853]' : 'text-[#ea4335]'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

