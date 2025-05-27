"use client";
import type { NextPage } from "next";
import React from "react";
import { ViewerWrapperProps } from "../../components/ReportViewer";

// 動的インポートを使用して、レポートビューワのラッパーをロードします。詳細については、「https://nextjs.org/docs/advanced-features/dynamic-import」を参照してください。
import dynamic from "next/dynamic";
const Viewer = dynamic<ViewerWrapperProps>(
  async () => {
    return (await import("../../components/ReportViewer")).default;
  },
  { ssr: false }
);

const Home: NextPage = () => {
  return (
    <div
      style={{ width: "100%", height: "100vh" }}
    >
      <Viewer reportUri="reports/Invoice_green.rdlx-json" language="ja" />
    </div>
  );
};

export default Home;