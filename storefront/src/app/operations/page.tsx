import JpegAndPng from "@/components/operations/jpeg-png";
import JpegAndWebp from "@/components/operations/jpeg-webp";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

function Operations() {
  return (
    <div>
      <Card className="bg-emerald-500/10 p-6 rounded-2xl shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]">
            Frequently Used Options
          </CardTitle>
        </CardHeader>
        <JpegAndPng  />
        <JpegAndPng reverse/>
        <JpegAndWebp />
        <JpegAndWebp reverse />
      </Card>
    </div>
  );
}
export default Operations;
