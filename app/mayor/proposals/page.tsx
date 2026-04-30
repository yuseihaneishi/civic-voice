import { PageContainer, PageTitle } from "@/components/ui/Card";
import {
  ProposalSections,
  ProposalSummary,
} from "@/components/ui/ProposalList";

export default function MayorProposalsPage() {
  return (
    <PageContainer>
      <PageTitle
        title="改善提案リスト"
        description="課題ごとに整理された改善提案の一覧です。市政判断が必要なものと、現場対応で進められるものに分かれています。"
      />
      <ProposalSummary />
      <ProposalSections />
    </PageContainer>
  );
}
