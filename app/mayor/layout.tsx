import { Header } from "@/components/ui/Header";
import { roleProfiles } from "@/lib/seed";

export default function MayorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = roleProfiles.mayor;
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <Header
        role="mayor"
        userName={profile.defaultName}
        userId={profile.defaultId}
      />
      {children}
    </div>
  );
}
