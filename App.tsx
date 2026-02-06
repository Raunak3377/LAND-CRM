
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PlotsList from './pages/PlotsList';
import PlotDetails from './pages/PlotDetails';
import AddPayment from './pages/AddPayment';
import PaymentsList from './pages/PaymentsList';
import AddExpense from './pages/AddExpense';
import ExpensesList from './pages/ExpensesList';
import ProjectSummary from './pages/ProjectSummary';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="plots" element={<PlotsList />} />
          <Route path="plots/:plotId" element={<PlotDetails />} />
          <Route path="add-payment" element={<AddPayment />} />
          <Route path="payments" element={<PaymentsList />} />
          <Route path="add-expense" element={<AddExpense />} />
          <Route path="expenses" element={<ExpensesList />} />
          <Route path="project" element={<ProjectSummary />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
