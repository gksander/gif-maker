import * as React from "react";
import { PageTitle } from "../components/PageTitle";
import { Spacer } from "../components/Spacer";
import { PageWrapper } from "../components/PageWrapper";

export const HomePage: React.FC = () => {
  return (
    <div>
      <PageTitle>Video Converter</PageTitle>
      <Spacer size="lg" />
      <PageWrapper>
        <div>Lorem</div>
      </PageWrapper>
    </div>
  );
};
