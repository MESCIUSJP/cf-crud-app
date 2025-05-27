'use client'
import dynamic from 'next/dynamic'

const FlexGrid = dynamic(
    () => {
        return import("../../components/FlexGrid");
    },
    { ssr: false }
);

export default function Home() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4 text-sky-500 ">
                Cloudflare x Wijmo × Next.jsサンプル
            </h1>
            <FlexGrid />
        </div>
    )
}