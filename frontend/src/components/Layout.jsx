import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Stethoscope } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f6] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 bg-[#f0f4f6] dark:bg-[#0b1120] transition-colors duration-200">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/90 dark:border-slate-800 bg-[#e8eff2] dark:bg-[#0f172a] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                MedConnect <span className="font-normal text-slate-500 dark:text-slate-400 text-xs">· CityCare Health System</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} CityCare Hospital. All rights reserved. Precision 10-minute clinical appointments.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
