
import { Plot, Payment, Expense, ProjectInfo } from '../types';

const BASE_URL = 'https://script.google.com/macros/s/AKfycbwmY5wrCEg5zo7DGBdz18_BqBc5qGQUYhzxQrF7Q8mGR_tJgynKdenH-5aO8EXxNy_O/exec';

/**
 * Robustly handles responses from Google Apps Script.
 * GAS often returns plain text for success messages or JSON for data.
 * This handler accommodates both and avoids "Unexpected token" errors.
 */
async function handleResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`Server responded with status: ${response.status}`);
  }

  const text = await response.text();
  
  // If empty response
  if (!text) {
    return { success: true };
  }

  try {
    // Attempt to parse as JSON
    return JSON.parse(text);
  } catch (e) {
    // If not JSON, return the raw text as a message
    // This handles strings like "Payment Added Successfully"
    return { success: true, message: text };
  }
}

/**
 * Common fetch wrapper for GAS to handle redirects and CORS correctly.
 */
async function gasFetch(url: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    method: 'GET',
    redirect: 'follow', // Crucial for Google Apps Script redirects
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    return handleResponse(response);
  } catch (error) {
    console.error(`API Call failed: ${url}`, error);
    throw error;
  }
}

export async function getPlots(): Promise<Plot[]> {
  return gasFetch(`${BASE_URL}?action=getPlots`);
}

export async function getPayments(): Promise<Payment[]> {
  return gasFetch(`${BASE_URL}?action=getPayments`);
}

export async function getExpenses(): Promise<Expense[]> {
  return gasFetch(`${BASE_URL}?action=getExpenses`);
}

export async function getProjectInfo(): Promise<ProjectInfo> {
  return gasFetch(`${BASE_URL}?action=getProjectInfo`);
}

export async function addPayment(payload: Partial<Payment>) {
  return gasFetch(`${BASE_URL}?action=addPayment`, {
    method: 'POST',
    body: JSON.stringify(payload),
    // Note: We avoid setting Content-Type: application/json to minimize CORS preflight 
    // issues with GAS in some production environments.
  });
}

export async function addExpense(payload: Partial<Expense>) {
  return gasFetch(`${BASE_URL}?action=addExpense`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function addPlot(payload: Partial<Plot>) {
  return gasFetch(`${BASE_URL}?action=addPlot`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
