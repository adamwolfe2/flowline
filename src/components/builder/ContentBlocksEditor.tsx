"use client";

import { useState } from "react";
import { FunnelConfig, ContentBlock } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquareQuote, ImageIcon, Video, Type, ChevronDown, ChevronUp, Plus, Check } from "lucide-react";

interface ContentBlocksEditorProps {
  config: FunnelConfig;
  onSave: (config: FunnelConfig) => void;
}

export function ContentBlocksEditor({ config, onSave }: ContentBlocksEditorProps) {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const blocks = config.quiz.contentBlocks || [];

  function addBlock(type: ContentBlock["type"]) {
    const newConfig = JSON.parse(JSON.stringify(config));
    if (!newConfig.quiz.contentBlocks) newConfig.quiz.contentBlocks = [];

    const id = `block-${Date.now()}`;
    const defaults: Record<string, ContentBlock["content"]> = {
      testimonial: { quote: "This program changed my business completely.", author: "John D.", role: "CEO" },
      image: { imageUrl: "", caption: "" },
      video: { videoUrl: "" },
      text: { heading: "", body: "" },
    };

    newConfig.quiz.contentBlocks.push({ id, type, content: defaults[type] || {} });
    onSave(newConfig);
    setExpandedBlock(id);
  }

  function updateBlock(blockId: string, content: ContentBlock["content"]) {
    const newConfig = JSON.parse(JSON.stringify(config));
    const block = newConfig.quiz.contentBlocks?.find((b: ContentBlock) => b.id === blockId);
    if (block) block.content = { ...block.content, ...content };
    onSave(newConfig);
  }

  function removeBlock(blockId: string) {
    const newConfig = JSON.parse(JSON.stringify(config));
    newConfig.quiz.contentBlocks = newConfig.quiz.contentBlocks?.filter((b: ContentBlock) => b.id !== blockId);
    onSave(newConfig);
    if (expandedBlock === blockId) setExpandedBlock(null);
  }

  const typeIcon: Record<string, React.ReactNode> = {
    testimonial: <MessageSquareQuote className="w-3.5 h-3.5" />,
    image: <ImageIcon className="w-3.5 h-3.5" />,
    video: <Video className="w-3.5 h-3.5" />,
    text: <Type className="w-3.5 h-3.5" />,
  };

  const typeLabel: Record<string, string> = {
    testimonial: "Testimonial",
    image: "Image",
    video: "Video",
    text: "Text Block",
  };

  const blockTypes = [
    { type: "testimonial" as const, icon: <MessageSquareQuote className="w-4 h-4" />, label: "Testimonial", desc: "Social proof quote" },
    { type: "image" as const, icon: <ImageIcon className="w-4 h-4" />, label: "Image", desc: "Photo or graphic" },
    { type: "video" as const, icon: <Video className="w-4 h-4" />, label: "Video", desc: "YouTube, Vimeo, Loom" },
    { type: "text" as const, icon: <Type className="w-4 h-4" />, label: "Text", desc: "Heading + paragraph" },
  ];

  return (
    <div className="space-y-5">
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 font-medium mb-1">Content Blocks</p>
        <p className="text-[11px] text-blue-600 leading-relaxed">
          These appear between your welcome screen and quiz questions.
          Add social proof, images, or context to increase conversions. Changes save automatically.
        </p>
      </div>

      {/* Add block buttons — always visible at top */}
      {blocks.length < 5 && (
        <div>
          <p className="text-[11px] font-medium text-gray-500 mb-2 flex items-center gap-1.5">
            <Plus className="w-3 h-3" />
            Add a block {blocks.length > 0 && <span className="text-gray-300 font-normal">({blocks.length}/5)</span>}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {blockTypes.map(({ type, icon, label, desc }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="flex items-start gap-2.5 p-2.5 border border-gray-200 rounded-lg hover:border-[#2D6A4F] hover:bg-green-50/50 transition-colors text-left group"
              >
                <span className="text-gray-400 group-hover:text-[#2D6A4F] mt-0.5">{icon}</span>
                <div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-[#2D6A4F]">{label}</span>
                  <span className="text-[10px] text-gray-400 block">{desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {blocks.length >= 5 && (
        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          <Check className="w-3 h-3" /> Maximum 5 blocks reached
        </p>
      )}

      {/* Existing blocks */}
      {blocks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-gray-500">
            Your blocks ({blocks.length})
            <span className="font-normal text-gray-400"> — shown in this order</span>
          </p>
          {blocks.map((block) => (
            <div key={block.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{typeIcon[block.type]}</span>
                  <span className="text-xs font-medium text-gray-700">{typeLabel[block.type]}</span>
                  {block.type === "testimonial" && block.content.author && (
                    <span className="text-[10px] text-gray-400 truncate max-w-[120px]">— {block.content.author}</span>
                  )}
                  {block.type === "text" && block.content.heading && (
                    <span className="text-[10px] text-gray-400 truncate max-w-[120px]">— {block.content.heading}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                    className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="Remove content block"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {expandedBlock === block.id ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                </div>
              </button>

              {expandedBlock === block.id && (
                <div className="px-3 pb-3 space-y-2 border-t border-gray-50">
                  {block.type === "testimonial" && (
                    <>
                      <div className="pt-2">
                        <Label className="text-[10px] text-gray-400">Quote</Label>
                        <Textarea
                          value={block.content.quote || ""}
                          onChange={e => updateBlock(block.id, { quote: e.target.value })}
                          className="text-xs mt-1 resize-none"
                          rows={3}
                          maxLength={300}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-gray-400">Author Name</Label>
                          <Input
                            value={block.content.author || ""}
                            onChange={e => updateBlock(block.id, { author: e.target.value })}
                            className="text-xs mt-1"
                            maxLength={50}
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-gray-400">Role / Title</Label>
                          <Input
                            value={block.content.role || ""}
                            onChange={e => updateBlock(block.id, { role: e.target.value })}
                            className="text-xs mt-1"
                            maxLength={50}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {block.type === "image" && (
                    <>
                      <div className="pt-2">
                        <Label className="text-[10px] text-gray-400">Image URL</Label>
                        <Input
                          value={block.content.imageUrl || ""}
                          onChange={e => updateBlock(block.id, { imageUrl: e.target.value })}
                          placeholder="https://..."
                          className="text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Caption (optional)</Label>
                        <Input
                          value={block.content.caption || ""}
                          onChange={e => updateBlock(block.id, { caption: e.target.value })}
                          className="text-xs mt-1"
                          maxLength={100}
                        />
                      </div>
                    </>
                  )}

                  {block.type === "video" && (
                    <div className="pt-2">
                      <Label className="text-[10px] text-gray-400">Video URL (YouTube, Vimeo, or Loom)</Label>
                      <Input
                        value={block.content.videoUrl || ""}
                        onChange={e => updateBlock(block.id, { videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        className="text-xs mt-1"
                      />
                    </div>
                  )}

                  {block.type === "text" && (
                    <>
                      <div className="pt-2">
                        <Label className="text-[10px] text-gray-400">Heading</Label>
                        <Input
                          value={block.content.heading || ""}
                          onChange={e => updateBlock(block.id, { heading: e.target.value })}
                          className="text-xs mt-1"
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Body Text</Label>
                        <Textarea
                          value={block.content.body || ""}
                          onChange={e => updateBlock(block.id, { body: e.target.value })}
                          className="text-xs mt-1 resize-none"
                          rows={3}
                          maxLength={500}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
