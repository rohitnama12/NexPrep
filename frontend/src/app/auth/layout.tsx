export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-96px)] p-4 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Auth Container */}
      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
