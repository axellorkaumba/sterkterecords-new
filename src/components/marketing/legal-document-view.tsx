import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LegalDocument } from "@/content/legal-types";

function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((paragraph, index) =>
        paragraph.startsWith("• ") ? (
          <li key={index} className="text-muted-foreground ml-5 list-disc">
            {paragraph.slice(2)}
          </li>
        ) : (
          <p key={index} className="text-muted-foreground">
            {paragraph}
          </p>
        ),
      )}
    </>
  );
}

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <div className="flex flex-col gap-3">
      {document.paragraphs ? <Paragraphs paragraphs={document.paragraphs} /> : null}

      {document.sections.map((section, index) => (
        <section key={index} className="mt-6 flex flex-col gap-3">
          <h2 className="text-h3 font-display">{section.heading}</h2>
          {section.paragraphs ? <Paragraphs paragraphs={section.paragraphs} /> : null}
          {section.table ? (
            <div className="border-border overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {section.table.headers.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.table.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
