import React, { useState } from "react";
import { X, PinIcon } from "lucide-react";

interface WriteAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  academyName: string;
  onSubmit: (announcement: {
    title: string;
    content: string;
    isPinned: boolean;
  }) => void;
}

export function WriteAnnouncementModal({ isOpen, onClose, academyName, onSubmit }: WriteAnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [errors, setErrors] = useState({ title: "", content: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { title: "", content: "" };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "제목을 작성해주세요.";
      isValid = false;
    } else if (title.trim().length > 30) {
      newErrors.title = "메시지가 너무 많습니다. 30자 이하로 줄여주세요.";
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = "공지 내용을 작성해주세요.";
      isValid = false;
    } else if (content.trim().length > 1000) {
      newErrors.content = "공지의 내용이 너무 많습니다. 1000자 이하로 줄여주세요.";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      isPinned,
    });
    setTitle("");
    setContent("");
    setIsPinned(false);
    setErrors({ title: "", content: "" });
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setIsPinned(false);
    setErrors({ title: "", content: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl bg-card border rounded-lg shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2>공지사항 작성</h2>
            {academyName && (
              <p className="text-sm text-muted-foreground mt-1">{academyName}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="title">제목</label>
              <span className={`text-xs ${title.length > 30 ? "text-destructive" : "text-muted-foreground"}`}>
                {title.length} / 30자
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors(prev => ({ ...prev, title: "" }));
              }}
              placeholder="공지사항 제목을 입력하세요"
              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.title ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"
              }`}
            />
            {errors.title && (
              <p className="mt-1.5 text-sm font-medium text-destructive">{errors.title}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content">내용</label>
              <span className={`text-xs ${content.length > 1000 ? "text-destructive" : "text-muted-foreground"}`}>
                {content.length} / 1000자
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setErrors(prev => ({ ...prev, content: "" }));
              }}
              placeholder="공지사항 내용을 입력하세요"
              rows={8}
              maxLength={1500}
              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 resize-none transition-all ${
                errors.content ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"
              }`}
            />
            {errors.content && (
              <p className="mt-1.5 text-sm font-medium text-destructive">{errors.content}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="pinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="pinned" className="flex items-center gap-2 cursor-pointer">
              <PinIcon className="w-4 h-4" />
              <span>상단 고정</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
