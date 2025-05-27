'use client'
import dynamic from 'next/dynamic'
import { ViewerWrapperProps } from "../../components/ReportViewer";

const MultiRowGrid = dynamic(
    () => {
        return import("../../components/MultiRowGrid");
    },
    { ssr: false }
);

const Viewer = dynamic<ViewerWrapperProps>(
  async () => {
    return (await import("../../components/ReportViewer")).default;
  },
  { ssr: false }
);

export default function Home() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4 text-sky-500 ">
                Cloudflare x Wijmo × ActiveReportsJS
            </h1>
            <div className="flex">
                <div style={{ width: "50%" }}>
                    <MultiRowGrid />
                </div>
                <div className="m-2" style={{ width: "50%", height: "78vh", marginTop: "66px"}}>
                    <Viewer reportUri="reports/Invoice_green.rdlx-json" language="ja" />
                </div>
            </div>
        </div>
    )
}