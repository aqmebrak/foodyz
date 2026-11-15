export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* No tab bar here: zero its height so the mobile flan sheet sits flush at the bottom. */}
      <style>{":root{--tabbar-h:0px}"}</style>
      <main>{children}</main>
    </div>
  );
}
