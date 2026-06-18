import React from 'react';
import { FileDown } from 'lucide-react';

interface ExportModalProps {
  isExportModalOpen: boolean;
  setIsExportModalOpen: (v: boolean) => void;
  exportBlankTemplatePdf: () => Promise<void>;
  exportWebRenderPdf: () => Promise<void>;
}

const ExportModal = React.memo(function ExportModal({
  isExportModalOpen,
  setIsExportModalOpen,
  exportBlankTemplatePdf,
  exportWebRenderPdf,
}: ExportModalProps) {
  if (!isExportModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface border-3 border-wilder-blue rounded-xl p-6 max-w-md w-full shadow-rough-lg space-y-5">
        <h3 className="text-xl font-bold font-serif text-ink flex items-center gap-2"><FileDown className="text-wilder-amber" /> 导出人物卡</h3>
        <p className="text-xs text-ink-muted">选择你需要的导出格式：</p>
        <div className="grid gap-3">
          <button onClick={exportBlankTemplatePdf} className="text-left border-2 border-surface-border rounded-lg p-4 hover:border-wilder-blue transition-colors bg-surface hover:bg-wilder-blue/5 group">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">📄</span>
              <div>
                <div className="font-bold text-sm text-ink group-hover:text-wilder-blue">空白卡 PDF</div>
                <p className="text-[10px] text-ink-muted mt-1 leading-relaxed">以原始空白人物卡为基底，填入角色数据。保留原版留白设计，便于打印后手写修改。</p>
              </div>
            </div>
          </button>
          <button onClick={exportWebRenderPdf} className="text-left border-2 border-surface-border rounded-lg p-4 hover:border-wilder-blue transition-colors bg-surface hover:bg-wilder-blue/5 group">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">💾</span>
              <div>
                <div className="font-bold text-sm text-ink group-hover:text-wilder-blue">数字卡 PDF</div>
                <p className="text-[10px] text-ink-muted mt-1 leading-relaxed">保留网页上的完整排版与样式，适合电子存档。所有编辑内容（状态、体力等）原样呈现。</p>
              </div>
            </div>
          </button>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={() => setIsExportModalOpen(false)} className="text-xs bg-surface-border border border-orange-700 text-ink px-4 py-2 rounded hover:bg-surface-dark transition-colors">取消</button>
        </div>
      </div>
    </div>
  );
});

export { ExportModal };