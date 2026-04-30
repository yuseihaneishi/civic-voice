import { PageContainer, PageTitle } from "@/components/ui/Card";
import {
  ProposalSections,
  ProposalSummary,
} from "@/components/ui/ProposalList";

export default function StaffProposalsPage() {
  return (
    <PageContainer>
      <PageTitle
        title="改善提案リスト"
        description="現場で寄せられた市民の声から整理された改善提案の一覧です。所管部署として進めるか、市政反映として上申するかを判断できます。"
      />
      <ProposalSummary />
      <ProposalSections />
    </PageContainer>
  );
}
