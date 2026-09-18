const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
};

export function AdminHeader({ userName, role }: { userName: string; role: string }) {
  return (
    <header className="hidden lg:flex items-center justify-between border-b border-rail-line px-8 h-16">
      <div />
      <div className="flex items-center gap-3 text-sm">
        <span className="text-rail-white">{userName}</span>
        <span className="px-2 py-0.5 border border-rail-gold/40 text-rail-gold text-xs font-semibold uppercase tracking-wide">
          {ROLE_LABEL[role] ?? role}
        </span>
      </div>
    </header>
  );
}
