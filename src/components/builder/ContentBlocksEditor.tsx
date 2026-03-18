"use client";

import { useState } from "react";
import { FunnelConfig, ContentBlock } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, MessageSquareQuote, ImageIcon, Video, Type, ChevronDown, ChevronUp } from "lucide-react";

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

  return (
    <div className="space-y-5">
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 font-medium mb-1">Content Blocks</p>
        <p className="text-[11px] text-blue-600 leading-relaxed">
          Add testimonials, images, videos, or text between the welcome screen and quiz questions
          to build trust and increase conversions.
        </p>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-gray-400 mb-3">No content blocks yet. Add one to enhance your funnel.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block) => (
            <div key={block.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{typeIcon[block.type]}</span>
                  <span className="text-xs font-medium text-gray-700">{typeLabel[block.type]}</span>
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

      <Separator />

      <div>
        <p className="text-[10px] text-gray-400 mb-2">Add a block:</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" onClick={() => addBlock("testimonial")} disabled={blocks.length >= 5}>
            <MessageSquareQuote className="w-3 h-3" /> Testimonial
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" onClick={() => addBlock("image")} disabled={blocks.length >= 5}>
            <ImageIcon className="w-3 h-3" /> Image
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" onClick={() => addBlock("video")} disabled={blocks.length >= 5}>
            <Video className="w-3 h-3" /> Video
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" onClick={() => addBlock("text")} disabled={blocks.length >= 5}>
            <Type className="w-3 h-3" /> Text
          </Button>
        </div>
        {blocks.length >= 5 && (
          <p className="text-[10px] text-gray-400 mt-1">Maximum 5 blocks</p>
        )}
      </div>
    </div>
  );
}
