import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './components/dashboard/DashboardView';
import { EntryRegistrationForm } from './components/entry/EntryRegistrationForm';
import { ExitRegistrationForm } from './components/exit/ExitRegistrationForm';
import { ReferralGuideMainView } from './components/referral-guide/ReferralGuideMainView';
import { KardexView } from './components/kardex/KardexView';
import { LoginPage } from './components/auth/LoginPage';
import { AccessDeniedView } from './components/common/AccessDeniedView';
import { SupplierStockView } from './components/stock/SupplierStockView';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainRouter: React.FC = () => {
  const { activeTab, canRegister } = useApp();

  switch (activeTab) {
    case 'dashboard':
      return <DashboardView />;
    case 'stock-proveedores':
      return <SupplierStockView />;
    case 'registro-ingreso':
      return canRegister ? <EntryRegistrationForm /> : <AccessDeniedView />;
    case 'registro-salida':
      return canRegister ? <ExitRegistrationForm /> : <AccessDeniedView />;
    case 'impresion-guia':
      return <ReferralGuideMainView />;
    case 'kardex':
      return <KardexView />;
    default:
      return <DashboardView />;
  }
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <ErrorBoundary>
        <MainRouter />
      </ErrorBoundary>
    </Layout>
  );
};

export function App() {
  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
}

export default App;
