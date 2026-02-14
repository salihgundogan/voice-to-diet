import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { HomePage } from '@/pages/HomePage';
import { ReportPage } from '@/pages/ReportPage';
import { ProfilePage } from '@/pages/ProfilePage';
import '@/styles/global.css';

export default function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
            <BottomNav />
        </BrowserRouter>
    );
}
