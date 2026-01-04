import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dbStatusToDisplay } from "@/lib/constant";
import { useCrunchItStore } from "@/store";
import { Progress } from "@ui";
import { FileText } from "lucide-react";

export function FileCrunchInfo() {
  const { filesData } = useCrunchItStore((state) => state);
  return (
    <section id="file-cards" className="mt-20 flex gap-10">
      {Object.keys(filesData).map((fileId) => {
        const fileData = filesData[fileId];
        return (
          <Card key={fileId}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div>
                  <FileText size={40} />
                </div>
                <div>{fileData.fileInfo.file.name}</div>
              </CardTitle>
              <CardDescription>{dbStatusToDisplay[fileData.currentState]}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-2 border rounded-2xl">
                <Progress value={fileData.progressInfo.progress} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
