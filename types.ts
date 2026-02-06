
export type PlotStatus = 'Sold' | 'Available' | 'Hold' | 'Investor';

export interface Plot {
  plot_id: string;
  project_id: string;
  plot_size: string | number;
  cost_price: number;
  sell_price: number;
  buyer_name: string;
  buyer_phone: string;
  status: PlotStatus;
  payment_received: number;
  pending_amount: number;
  sold_date: string;
  investor_name: string;
  investor_share: number;
}

export interface Payment {
  payment_id: string;
  plot_id: string;
  buyer_name: string;
  amount: number;
  date: string;
  mode: 'Cash' | 'UPI' | 'Bank';
  received_by: string;
  note: string;
}

export interface Expense {
  expense_id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  done_by: string;
}

export interface ProjectInfo {
  project_id: string;
  project_name: string;
  total_plots: number;
  total_cost_price: number;
  total_selling_value: number;
  total_payments_received: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
}
