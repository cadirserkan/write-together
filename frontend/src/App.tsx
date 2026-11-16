import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { BookPage } from './pages/BookPage';
import { BookshelfPage } from './pages/BookshelfPage';
import { InvitePage } from './pages/InvitePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Everything below needs a logged-in user */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<BookshelfPage />} />
            <Route path="/books/:id" element={<BookPage />} />
            <Route path="/invite/:code" element={<InvitePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
