"use client";

interface EmailPreviewProps {
  subject: string;
  body: string;
  brandName: string;
  brandColor?: string;
}

const SAMPLE_DATA: Record<string, string> = {
  "{email}": "sarah@example.com",
  "{score}": "8",
  "{tier}": "high",
  "{calendar_url}": "https://cal.com/you/call",
  "{funnel_name}": "",
};

function replacePlaceholders(text: string, brandName: string): string {
  let result = text;
  const data = { ...SAMPLE_DATA, "{funnel_name}": brandName || "My Funnel" };
  for (const [placeholder, value] of Object.entries(data)) {
    result = result.replaceAll(placeholder, value);
  }
  return result;
}

function bodyToHtml(body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\n/g, "<br />");
}

export function EmailPreview({
  subject,
  body,
  brandName,
  brandColor = "#2D6A4F",
}: EmailPreviewProps) {
  const renderedSubject = replacePlaceholders(subject, brandName);
  const renderedBody = bodyToHtml(replacePlaceholders(body, brandName));

  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Email client chrome */}
      <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-[#9CA3AF]">
            <span className="font-medium text-[#6B7280]">From:</span>{" "}
            {brandName || "Your Business"} &lt;noreply@getmyvsl.com&gt;
          </p>
          <p className="text-[10px] text-[#9CA3AF]">
            <span className="font-medium text-[#6B7280]">To:</span>{" "}
            sarah@example.com
          </p>
          <p className="text-[10px] text-[#9CA3AF]">
            <span className="font-medium text-[#6B7280]">Subject:</span>{" "}
            <span className="text-[#111827] font-medium">{renderedSubject}</span>
          </p>
        </div>
      </div>

      {/* Accent bar */}
      <div className="h-0.5" style={{ backgroundColor: brandColor }} />

      {/* Email body */}
      <div className="px-4 py-4">
        <div
          className="text-xs text-[#374151] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderedBody }}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-[#E5E7EB] px-4 py-2 bg-[#F9FAFB]">
        <p className="text-[9px] text-[#9CA3AF]">
          Preview only -- placeholders replaced with sample data
        </p>
      </div>
    </div>
  );
}
