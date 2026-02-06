
import { Plot, Payment, Expense, ProjectInfo } from '../types';

const BASE_URL = 'https://script.google.com/macros/s/AKfycbwmY5wrCEg5zo7DGBdz18_BqBc5qGQUYhzxQrF7Q8mGR_tJgynKdenH-5aO8EXxNy_O/exec';

export async function getPlots(): Promise<Plot[]> {
  const response = await fetch(`${BASE_URL}?action=getPlots`);
  const data = await response.json();
  return data;
}

export async function getPayments(): Promise<Payment[]> {
  const response = await fetch(`${BASE_URL}?action=getPayments`);
  const data = await response.json();
  return data;
}

export async function getExpenses(): Promise<Expense[]> {
  const response = await fetch(`${BASE_URL}?action=getExpenses`);
  const data = await response.json();
  return data;
}

export async function getProjectInfo(): Promise<ProjectInfo> {
  const response = await fetch(`${BASE_URL}?action=getProjectInfo`);
  const data = await response.json();
  return data;
}

export async function addPayment(payload: Partial<Payment>) {
  const response = await fetch(`${BASE_URL}?action=addPayment`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function addExpense(payload: Partial<Expense>) {
  const response = await fetch(`${BASE_URL}?action=addExpense`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function addPlot(payload: Partial<Plot>) {
  const response = await fetch(`${BASE_URL}?action=addPlot`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
}
