export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBEB] via-white to-tof-mint/20">
      <main className="container flex min-h-screen items-center justify-center px-4 py-16">
        {children}
      </main>
    </div>
  );
}
