import { Header } from "@/components/ui/Header";
import { roleProfiles } from "@/lib/seed";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = roleProfiles.citizen;
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <Header
        role="citizen"
        userName={profile.defaultName}
        userId={profile.defaultId}
      />
      {children}
    </div>
  );
}
