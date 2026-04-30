import { Header } from "@/components/ui/Header";
import { roleProfiles } from "@/lib/seed";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = roleProfiles.staff;
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <Header
        role="staff"
        userName={profile.defaultName}
        userId={profile.defaultId}
      />
      {children}
    </div>
  );
}
