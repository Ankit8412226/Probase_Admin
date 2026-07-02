import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[-5%] right-[20%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <PublicHeader />
      <main className="relative z-10 min-h-[calc(100vh-80px-260px)]">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
