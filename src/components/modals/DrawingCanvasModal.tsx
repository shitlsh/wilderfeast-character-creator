import React from 'react';
import type { UseCanvasDrawingReturn } from '../../hooks/useCanvasDrawing';

interface DrawingCanvasModalProps {
  isDrawingModalOpen: boolean;
  setIsDrawingModalOpen: (v: boolean) => void;
  isPortraitEditMode: boolean;
  setIsPortraitModalOpen: (v: boolean) => void;
  drawing: UseCanvasDrawingReturn;
  saveBackgroundDrawing: () => void;
}

const DrawingCanvasModal = React.memo(function DrawingCanvasModal({
  isDrawingModalOpen,
  setIsDrawingModalOpen,
  isPortraitEditMode,
  setIsPortraitModalOpen,
  drawing,
  saveBackgroundDrawing,
}: DrawingCanvasModalProps) {
  if (!isDrawingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4" onTouchMove={(e) => e.preventDefault()}>
      <div className="bg-[#2d100c] border-3 border-wilder-blue rounded-xl p-3 sm:p-5 max-w-lg w-full shadow-rough-lg">
        <h3 className="text-lg font-bold font-serif text-wilder-blue mb-1">✏️ {isPortraitEditMode ? '手绘角色插图' : '手绘背景插图'}</h3>
        <p className="text-xs text-wilder-amber mb-3">在下方区域自由绘制你的角色{isPortraitEditMode ? '插图' : '背景插图'}</p>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-wilder-amber mr-1">颜色</span>
            {['#2d100c','#1a1a1a','#8b4513','#a0522d','#556b2f','#8b6c4c','#d2691e','#c56b4e'].map(c => (
              <button key={c} type="button" onClick={() => drawing.setDrawPenColor(c)} className={`w-5 h-5 rounded-full border-2 transition-all ${drawing.drawPenColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-wilder-amber mr-1">粗细</span>
            {[2, 4, 6, 10].map(s => (
              <button key={s} type="button" onClick={() => drawing.setDrawPenSize(s)} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all ${drawing.drawPenSize === s ? 'bg-wilder-blue text-white' : 'bg-surface-border text-ink-muted'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="drawing-grid rounded-lg overflow-hidden border-2 border-wilder-blue w-full h-[260px] sm:h-[320px]">
          <canvas ref={drawing.canvasRef} className="w-full h-full cursor-crosshair" onMouseDown={drawing.startDrawing} onMouseMove={drawing.draw} onMouseUp={drawing.stopDrawing} onMouseLeave={drawing.stopDrawing} onTouchStart={drawing.startTouchDrawing} onTouchMove={drawing.drawTouch} onTouchEnd={drawing.stopTouchDrawing} />
        </div>
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex space-x-2">
            <button type="button" onClick={drawing.undoCanvas} disabled={!drawing.canUndo} className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-2 py-1 rounded hover:bg-amber-900 disabled:opacity-30 disabled:cursor-not-allowed">↩️ 撤销</button>
            <button type="button" onClick={drawing.redoCanvas} disabled={!drawing.canRedo} className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-2 py-1 rounded hover:bg-amber-900 disabled:opacity-30 disabled:cursor-not-allowed">↪️ 重做</button>
            <button type="button" onClick={drawing.clearCanvas} className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-2 py-1 rounded hover:bg-amber-900">🗑️ 清除</button>
            <label className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-2 py-1 rounded cursor-pointer hover:bg-amber-900">🖼️ 底图<input type="file" accept="image/*" onChange={drawing.uploadDrawingPhoto} className="hidden" /></label>
          </div>
          <div className="flex space-x-2">
            <button type="button" onClick={() => { if (isPortraitEditMode) { setIsDrawingModalOpen(false); setIsPortraitModalOpen(true); } else { setIsDrawingModalOpen(false); } }} className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-3 py-1 rounded hover:bg-amber-900">取消</button>
            <button type="button" onClick={saveBackgroundDrawing} className="text-xs bg-wilder-blue border border-wilder-blue text-white px-3 py-1 rounded font-bold hover:bg-wilder-blue">💾 {isPortraitEditMode ? '保存插图' : '保存背景图'}</button>
          </div>
        </div>
      </div>
    </div>
  );
});

export { DrawingCanvasModal };