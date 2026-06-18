import { useState, useRef, useCallback, useEffect } from 'react';

interface DrawingState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
}

export interface UseCanvasDrawingReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  drawPenColor: string;
  setDrawPenColor: (c: string) => void;
  drawPenSize: number;
  setDrawPenSize: (s: number) => void;
  canvasHistoryTick: number;
  initCanvas: () => void;
  applyPenStyle: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undoCanvas: () => void;
  redoCanvas: () => void;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  startTouchDrawing: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  drawTouch: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  stopTouchDrawing: () => void;
  clearCanvas: () => void;
  getCanvasDataUrl: () => string;
  loadImageOntoCanvas: (dataUrl: string) => void;
  uploadDrawingPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetHistory: () => void;
}

export function useCanvasDrawing(): UseCanvasDrawingReturn {
  const [drawPenColor, setDrawPenColor] = useState('#2d100c');
  const [drawPenSize, setDrawPenSize] = useState(3);
  const [canvasHistoryTick, setCanvasHistoryTick] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingStateRef = useRef<DrawingState>({ isDrawing: false, lastX: 0, lastY: 0 });
  const canvasHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);

  useEffect(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < canvasHistoryRef.current.length - 1);
  }, [canvasHistoryTick]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = drawPenColor;
    ctx.lineWidth = drawPenSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [drawPenColor, drawPenSize]);

  const applyPenStyle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = drawPenColor;
    ctx.lineWidth = drawPenSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [drawPenColor, drawPenSize]);

  const saveHistoryState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const hist = canvasHistoryRef.current;
    const idx = historyIndexRef.current;
    hist.length = idx + 1;
    hist.push(dataUrl);
    if (hist.length > 20) hist.shift();
    historyIndexRef.current = hist.length - 1;
    setCanvasHistoryTick(t => t + 1);
  }, []);

  const undoCanvas = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const hist = canvasHistoryRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !hist[historyIndexRef.current]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.strokeStyle = drawPenColor;
      ctx.lineWidth = drawPenSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    img.src = hist[historyIndexRef.current];
    setCanvasHistoryTick(t => t + 1);
  }, [drawPenColor, drawPenSize]);

  const redoCanvas = useCallback(() => {
    const hist = canvasHistoryRef.current;
    if (historyIndexRef.current >= hist.length - 1) return;
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    if (!canvas || !hist[historyIndexRef.current]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.strokeStyle = drawPenColor;
      ctx.lineWidth = drawPenSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    img.src = hist[historyIndexRef.current];
    setCanvasHistoryTick(t => t + 1);
  }, [drawPenColor, drawPenSize]);

  const getCanvasPos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const getTouchCanvasPos = useCallback((touch: React.Touch | Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    applyPenStyle();
    const pos = getCanvasPos(e);
    drawingStateRef.current.isDrawing = true;
    drawingStateRef.current.lastX = pos.x;
    drawingStateRef.current.lastY = pos.y;
  }, [applyPenStyle, getCanvasPos]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingStateRef.current.isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasPos(e);

    ctx.beginPath();
    ctx.moveTo(drawingStateRef.current.lastX, drawingStateRef.current.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    drawingStateRef.current.lastX = pos.x;
    drawingStateRef.current.lastY = pos.y;
  }, [getCanvasPos]);

  const stopDrawing = useCallback(() => {
    if (drawingStateRef.current.isDrawing) {
      drawingStateRef.current.isDrawing = false;
      saveHistoryState();
    }
  }, [saveHistoryState]);

  const startTouchDrawing = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    applyPenStyle();
    const touch = e.touches[0];
    const pos = getTouchCanvasPos(touch);
    drawingStateRef.current.isDrawing = true;
    drawingStateRef.current.lastX = pos.x;
    drawingStateRef.current.lastY = pos.y;
    e.preventDefault();
  }, [applyPenStyle, getTouchCanvasPos]);

  const drawTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingStateRef.current.isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const touch = e.touches[0];
    const pos = getTouchCanvasPos(touch);

    ctx.beginPath();
    ctx.moveTo(drawingStateRef.current.lastX, drawingStateRef.current.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    drawingStateRef.current.lastX = pos.x;
    drawingStateRef.current.lastY = pos.y;
    e.preventDefault();
  }, [getTouchCanvasPos]);

  const stopTouchDrawing = useCallback(() => {
    if (drawingStateRef.current.isDrawing) {
      drawingStateRef.current.isDrawing = false;
      saveHistoryState();
    }
  }, [saveHistoryState]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);
    ctx.strokeStyle = drawPenColor;
    ctx.lineWidth = drawPenSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    canvasHistoryRef.current = [];
    historyIndexRef.current = -1;
    setCanvasHistoryTick(t => t + 1);
  }, [drawPenColor, drawPenSize]);

  const getCanvasDataUrl = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  }, []);

  const loadImageOntoCanvas = useCallback((dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.strokeStyle = drawPenColor;
      ctx.lineWidth = drawPenSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      saveHistoryState();
    };
    img.src = dataUrl;
  }, [drawPenColor, drawPenSize, saveHistoryState]);

  const uploadDrawingPhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) loadImageOntoCanvas(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [loadImageOntoCanvas]);

  const resetHistory = useCallback(() => {
    canvasHistoryRef.current = [];
    historyIndexRef.current = -1;
    setCanvasHistoryTick(t => t + 1);
  }, []);

  return {
    canvasRef,
    drawPenColor, setDrawPenColor,
    drawPenSize, setDrawPenSize,
    canvasHistoryTick,
    initCanvas,
    applyPenStyle,
    canUndo, canRedo,
    undoCanvas, redoCanvas,
    startDrawing, draw, stopDrawing,
    startTouchDrawing, drawTouch, stopTouchDrawing,
    clearCanvas,
    getCanvasDataUrl,
    loadImageOntoCanvas,
    uploadDrawingPhoto,
    resetHistory,
  };
}
