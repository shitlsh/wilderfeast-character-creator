import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { Dice5, Download, ArrowLeft, FileDown } from 'lucide-react';
import { PDFDocument, rgb, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { TOOLS, LINEAGES } from '../data';
import { APPENDIX_TRAITS, APPENDIX_STATES } from '../appendixData';
import { useCharacter } from '../context/CharacterContext';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { SheetPage1 } from '../components/sheet/SheetPage1';
import { SheetPage2 } from '../components/sheet/SheetPage2';

const DiceDrawer = React.lazy(() => import('../components/sheet/DiceDrawer').then(m => ({ default: m.DiceDrawer })));
const ExportModal = React.lazy(() => import('../components/modals/ExportModal').then(m => ({ default: m.ExportModal })));
const StateModal = React.lazy(() => import('../components/modals/StateModal').then(m => ({ default: m.StateModal })));
const PortraitModal = React.lazy(() => import('../components/modals/PortraitModal').then(m => ({ default: m.PortraitModal })));
const PickerModal = React.lazy(() => import('../components/modals/PickerModal').then(m => ({ default: m.PickerModal })));
const DrawingCanvasModal = React.lazy(() => import('../components/modals/DrawingCanvasModal').then(m => ({ default: m.DrawingCanvasModal })));

export default function PlayPage() {
  const { id } = useParams<{ id: string }>();
  const {
    characters, setSelectedCharId, showNotification,
    activeChar, setCharacters, saveCustomCharacters,
    updateActiveCharStat, updateActiveCharStyle, updateActiveCharSkill,
    handleJsonExport
  } = useCharacter();

  useEffect(() => {
    if (id) setSelectedCharId(id);
  }, [id, setSelectedCharId]);

  const [diceRoll, setDiceRoll] = useState<{
    styleName: string;
    skillName: string;
    styleCount: number;
    skillBonus: number;
    rolled: boolean;
    dice: { value: number; active: boolean; adjustedValue: number }[];
    successes: number;
    actionRating: number;
    actionDieType: 'd8' | 'd20';
    actionDieValue: number;
  } | null>(null);

  const [selectedRollStyle, setSelectedRollStyle] = useState<string>('力量');
  const [selectedRollSkill, setSelectedRollSkill] = useState<string>('打击');
  const [actionDieMode, setActionDieMode] = useState<'focus' | 'wild'>('focus');

  const [isDiceDrawerOpen, setIsDiceDrawerOpen] = useState<boolean>(false);
  const [appendixSearchQuery] = useState('');
  const [pickerModal, setPickerModal] = useState<'none' | 'technique' | 'trait'>('none');
  const [pickerSearch, setPickerSearch] = useState('');
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [pendingState, setPendingState] = useState('');
  const [pendingStateLevel, setPendingStateLevel] = useState(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);
  const [isPortraitEditMode, setIsPortraitEditMode] = useState(false);
  const [editPortraitType, setEditPortraitType] = useState<'portrait' | 'upload' | 'drawing'>('portrait');
  const [editPortraitValue, setEditPortraitValue] = useState('');

  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const drawing = useCanvasDrawing();

  const cardPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDrawingModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (isPortraitEditMode) {
            setIsPortraitModalOpen(true);
          }
          setIsDrawingModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKey);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKey);
      };
    }
    return () => {};
  }, [isDrawingModalOpen]);

  const handleRollDice = (styleName: string, styleCount: number, skillName: string, skillBonus: number, dieMode: 'focus' | 'wild') => {
    const diceList = Array.from({ length: styleCount }, () => {
      const val = Math.floor(Math.random() * 6) + 1;
      return { value: val, active: false, adjustedValue: val };
    });

    const dieType = dieMode === 'focus' ? 'd8' : 'd20';
    const dieVal = Math.floor(Math.random() * (dieMode === 'focus' ? 8 : 20)) + 1;

    const successes = diceList.filter(d => d.value >= 5).length;

    setDiceRoll({
      styleName,
      skillName,
      styleCount,
      skillBonus,
      rolled: true,
      dice: diceList,
      successes,
      actionRating: successes > 0 ? dieVal : 0,
      actionDieType: dieType,
      actionDieValue: dieVal
    });
  };

  const toggleDiceActive = (index: number) => {
    if (!diceRoll) return;

    const currentBonusUsed = diceRoll.dice.filter(d => d.active).length;

    const nextDice = diceRoll.dice.map((d, i) => {
      if (i === index) {
        const willBeActive = !d.active;
        if (willBeActive && currentBonusUsed >= diceRoll.skillBonus) {
          showNotification(`你的 [${diceRoll.skillName}] 技能等级只有 +${diceRoll.skillBonus}，无法应用更多加值。`, 'info');
          return d;
        }
        return {
          ...d,
          active: willBeActive,
          adjustedValue: willBeActive ? Math.min(6, d.value + 1) : d.value
        };
      }
      return d;
    });

    const successes = nextDice.filter(d => d.adjustedValue >= 5).length;

    setDiceRoll({
      ...diceRoll,
      dice: nextDice,
      successes,
      actionRating: successes > 0 ? diceRoll.actionDieValue : 0
    });
  };

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditPortraitType('upload');
      setEditPortraitValue(event.target?.result as string);
      showNotification('自定义插图上传成功！', 'success');
    };
    reader.readAsDataURL(file);
  };

  const openPortraitDrawingModal = () => {
    setIsPortraitModalOpen(false);
    setIsPortraitEditMode(true);
    setIsDrawingModalOpen(true);
    drawing.resetHistory();
    setTimeout(() => {
      drawing.initCanvas();
      if (editPortraitType === 'drawing' && editPortraitValue) {
        drawing.loadImageOntoCanvas(editPortraitValue);
      }
    }, 100);
  };

  const saveBackgroundDrawing = () => {
    const dataUrl = drawing.getCanvasDataUrl();
    if (!dataUrl) return;
    if (isPortraitEditMode) {
      setEditPortraitType('drawing');
      setEditPortraitValue(dataUrl);
      setIsDrawingModalOpen(false);
      setIsPortraitModalOpen(true);
      showNotification('手绘插图保存成功！', 'success');
    } else {
      setIsDrawingModalOpen(false);
      showNotification('手绘背景图保存成功！', 'success');
    }
  };

  const exportBlankTemplatePdf = async () => {
    if (!activeChar) return;
    setIsExportModalOpen(false);
    showNotification('正在生成空白卡PDF，请稍候...', 'info');

    try {
      const [templateBytes, fontBytes] = await Promise.all([
        fetch('/空白人物卡.pdf').then(r => r.arrayBuffer()),
        fetch('/fonts/NotoSansSC-Regular.ttf').then(r => r.arrayBuffer()),
      ]);

      const pdfDoc = await PDFDocument.load(templateBytes);
      pdfDoc.registerFontkit(fontkit);
      const customFont = await pdfDoc.embedFont(fontBytes);
      const pages = pdfDoc.getPages();
      const page1 = pages[0];
      const page2 = pages[1];

      const darkInk = rgb(0.1, 0.18, 0.3);
      const grayInk = rgb(0.25, 0.32, 0.4);

      const draw = (page: PDFPage, text: string, x: number, y: number, size = 10, color = darkInk) => {
        page.drawText(text, { x, y, size, font: customFont, color });
      };

      const drawCentered = (page: PDFPage, text: string, cx: number, y: number, size = 10, color = darkInk) => {
        const width = customFont.widthOfTextAtSize(text, size);
        page.drawText(text, { x: cx - width / 2, y, size, font: customFont, color });
      };

      const drawWrapped = (
        page: PDFPage,
        text: string,
        x: number,
        startY: number,
        maxWidth: number,
        fontSize = 8,
        lineHeight = 12,
        color = grayInk
      ): number => {
        const chars = Array.from(text);
        const lines: string[] = [];
        let currentLine = '';

        for (const char of chars) {
          const testLine = currentLine + char;
          const width = customFont.widthOfTextAtSize(testLine, fontSize);
          if (width <= maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = char;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }

        let currY = startY;
        for (const line of lines) {
          page.drawText(line, { x, y: currY, size: fontSize, font: customFont, color });
          currY -= lineHeight;
        }
        return currY;
      };

      draw(page1, activeChar.name, 55, 688, 13);
      draw(page1, activeChar.playerName || activeChar.name, 280, 688, 11);
      draw(page1, activeChar.specialty, 440, 688, 11);

      const styles = [
        { key: 'power', y: 623 },
        { key: 'precision', y: 603 },
        { key: 'swiftness', y: 583 },
        { key: 'technique', y: 563 },
      ];
      styles.forEach(st => {
        const val = activeChar.styleValues[st.key as keyof typeof activeChar.styleValues] || 1;
        if (val === 0) return;
        drawCentered(page1, String(val), 151, st.y, 14);
      });

      const skillNames = ['激励', '展示', '射击', '发声', '抓取', '打击', '手艺', '储存', '学习', '治愈', '搜索', '穿越'];
      skillNames.forEach((sk, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const val = activeChar.skills[sk] || 0;
        if (val === 0) return;
        const cx = col === 0 ? 295 : col === 1 ? 414 : 524;
        const cy = 627 - row * 23;
        drawCentered(page1, `+${val}`, cx, cy, 9);
      });

      draw(page1, activeChar.tool, 90, 478, 10);
      draw(page1, "射程: 1 (打击)", 95, 440, 8, darkInk);
      draw(page1, "损坏时: 射程:1(打击)。该身体部位造成伤害减半。", 95, 426, 7, grayInk);

      drawCentered(page1, String(activeChar.durability), 230, 452, 12);
      drawCentered(page1, String(activeChar.durabilityMax), 270, 452, 12);

      let techY = 382;
      (activeChar.techniques || []).forEach(tName => {
        const foundTech = TOOLS.flatMap(tl => tl.techniques).find(tk => tk.name === tName);
        const cost = foundTech?.cost || '被动';
        const effect = foundTech?.effect || tName;

        if (techY >= 150) {
          draw(page1, `【${tName}】 (${cost})`, 45, techY, 9, darkInk);
          techY -= 20;

          techY = drawWrapped(page1, effect, 45, techY, 235, 8, 20, grayInk);
          techY -= 15;
        }
      });

      const customTraits = activeChar.traits.slice(2);
      let traitY = 432;
      customTraits.forEach(tName => {
        let trEffect = '融入你自身的野性肉体异能与突变绝技。';
        let trCost = '被动';

        const foundA = APPENDIX_TRAITS.find(at => at.name === tName);
        if (foundA) {
          trEffect = foundA.effect;
          trCost = foundA.cost;
        } else {
          const foundLineageTrait = LINEAGES.flatMap(l => l.traits).find(t => t.name === tName);
          if (foundLineageTrait) {
            trEffect = foundLineageTrait.effect;
            trCost = foundLineageTrait.cost || '被动';
          }
        }

        if (traitY >= 150) {
          draw(page1, `【${tName}】 (${trCost})`, 305, traitY, 9, darkInk);
          traitY -= 20;

          const nextY = drawWrapped(page1, trEffect, 305, traitY, 220, 8, 20, grayInk);
          traitY = nextY;
          traitY -= 20;
        }
      });

      drawCentered(page1, "20", 206, 62, 18);

      if (activeChar.statesActive && activeChar.statesActive.length > 0) {
        const stateText = activeChar.statesActive.map(s => `${s.name}${s.level ? ` ${s.level}` : ''}`).join('  ');
        draw(page1, stateText, 305, 92, 10, darkInk);

        let stateEffectY = 72;
        activeChar.statesActive.slice(0, 2).forEach(st => {
          const found = APPENDIX_STATES.find(s => s.name.replace('X', '').trim() === st.name || s.name.startsWith(st.name));
          if (found && stateEffectY >= 52) {
            const effect = found.name.includes('X') ? found.effect.replace(/X/g, String(st.level)) : found.effect;
            const displayEffect = st.name === '受伤'
              ? found.effect.split(/受伤\d[：:]/g).filter(Boolean)[st.level - 1] || found.effect
              : effect;
            draw(page1, `${st.name}: ${displayEffect}`, 305, stateEffectY, 8, grayInk);
            stateEffectY -= 20;
          }
        });
      }

      draw(page2, activeChar.name, 55, 688, 13);
      draw(page2, activeChar.playerName || activeChar.name, 280, 688, 11);
      draw(page2, activeChar.specialty, 440, 688, 11);

      draw(page2, activeChar.adjectives[0], 202, 647, 12);
      draw(page2, activeChar.adjectives[1], 202, 620, 12);

      draw(page2, activeChar.companion.name, 55, 575, 11);
      drawWrapped(page2, `"${activeChar.companion.description}"`, 55, 555, 170, 8, 11, grayInk);

      drawCentered(page2, activeChar.backgroundMeals.upbringing.meal.split('&')[0]?.trim() || '黑麦酸面包', 92, 430, 11);
      drawCentered(page2, activeChar.backgroundMeals.upbringing.meal.split('&')[1]?.trim() || '方舟乌木胡椒', 206, 430, 11);

      let imgBytes: ArrayBuffer | null = null;
      let imgIsPng = true;

      if (activeChar.backgroundType === 'upload' || activeChar.backgroundType === 'drawing') {
        if (activeChar.backgroundValue && activeChar.backgroundValue.startsWith('data:image/')) {
          imgIsPng = activeChar.backgroundValue.includes('png');
          const base64Data = activeChar.backgroundValue.split(',')[1];
          const binaryStr = atob(base64Data);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          imgBytes = bytes.buffer;
        }
      } else {
        const preGens = ['普莱兹', '巴格', '娜特·辛', '泰伦', '莲恩', '诺特'];
        if (preGens.includes(activeChar.name)) {
          try {
            imgBytes = await fetch(`/portraits/${activeChar.name}.png`).then(r => r.arrayBuffer());
            imgIsPng = true;
          } catch (e) {
            console.error('Failed to load pregen portrait for PDF', e);
          }
        }
      }

      if (imgBytes) {
        try {
          const img = imgIsPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
          const imgDims = img.scaleToFit(260, 210);
          page2.drawImage(img, {
            x: 255 + (287 - imgDims.width) / 2,
            y: 430 + (230 - imgDims.height) / 2,
            width: imgDims.width,
            height: imgDims.height,
          });
        } catch (imgErr) {
          console.error('Error embedding image into PDF:', imgErr);
        }
      }

      const bg = activeChar.backgroundMeals;
      const courseWidth = 420;
      const courseLeading = 14;

      draw(page2, `${bg.upbringing.meal} (+1 ${bg.upbringing.skill})`, 100, 352, 10, darkInk);
      drawWrapped(page2, bg.upbringing.text, 100, 334, courseWidth, 8, courseLeading, grayInk);

      draw(page2, `${bg.motivation.meal} (+1 ${bg.motivation.skill})`, 100, 270, 10, darkInk);
      drawWrapped(page2, bg.motivation.text, 100, 252, courseWidth, 8, courseLeading, grayInk);

      draw(page2, `${bg.ambition.meal} (+1 ${bg.ambition.skill})`, 100, 194, 10, darkInk);
      drawWrapped(page2, bg.ambition.text, 100, 176, courseWidth, 8, courseLeading, grayInk);

      drawWrapped(page2, activeChar.bond, 70, 112, courseWidth, 8, 14, grayInk);

      if (activeChar.notes) {
        drawWrapped(page2, `备注: ${activeChar.notes}`, 70, 56, courseWidth, 8, 14, grayInk);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeChar.name}_空白人物卡.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('空白卡PDF导出成功！', 'success');
    } catch (e) {
      console.error(e);
      showNotification('空白卡PDF生成失败', 'error');
    }
  };

  const exportWebRenderPdf = async () => {
    if (!activeChar) return;
    setIsExportModalOpen(false);
    showNotification('正在生成数字卡PDF，请稍候...', 'info');

    try {
      const page1El = document.getElementById('sheet-page-1');
      const page2El = document.getElementById('sheet-page-2');
      if (!page1El || !page2El) throw new Error('Sheet pages not found');

      const hideControls = (el: HTMLElement) => {
        const controls = el.querySelectorAll('button, input, select, textarea');
        const restored: { el: HTMLElement; display: string }[] = [];
        controls.forEach((c) => {
          const htmlEl = c as HTMLElement;
          restored.push({ el: htmlEl, display: htmlEl.style.display });
          htmlEl.style.display = 'none';
        });
        return restored;
      };

      const fixOverflow = (el: HTMLElement) => {
        const orig = el.style.overflow;
        el.style.overflow = 'visible';
        return orig;
      };

      const fixAllOverflow = (el: HTMLElement) => {
        const restoreList: { el: HTMLElement; orig: string }[] = [];
        restoreList.push({ el, orig: fixOverflow(el) });
        el.querySelectorAll('.overflow-hidden, [class*="overflow-hidden"]').forEach((child) => {
          const htmlEl = child as HTMLElement;
          restoreList.push({ el: htmlEl, orig: htmlEl.style.overflow });
          htmlEl.style.overflow = 'visible';
        });
        return restoreList;
      };

      const restoredControls1 = hideControls(page1El);
      const restoredControls2 = hideControls(page2El);
      const restoredOverflow1 = fixAllOverflow(page1El);
      const restoredOverflow2 = fixAllOverflow(page2El);

      const a4WidthPx = 775;
      const origWidth1 = page1El.style.width;
      const origWidth2 = page2El.style.width;
      page1El.style.width = `${a4WidthPx}px`;
      page2El.style.width = `${a4WidthPx}px`;

      page1El.style.boxSizing = 'border-box';
      page2El.style.boxSizing = 'border-box';

      const styleCards = page1El.querySelectorAll('[class*="cursor-pointer"]');
      const restoredStyles: { el: HTMLElement; origClass: string }[] = [];
      styleCards.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.className.includes('bg-[#fc8419]')) {
          restoredStyles.push({ el: htmlEl, origClass: htmlEl.className });
          htmlEl.className = 'border-2 border-surface-border rounded p-2 flex items-center justify-between cursor-pointer transition-all bg-white hover:bg-orange-100 text-ink';
        }
      });

      await new Promise(r => setTimeout(r, 100));

      const [canvas1, canvas2] = await Promise.all([
        html2canvas(page1El, { useCORS: true, scale: 2, backgroundColor: '#faf6ef', logging: false }),
        html2canvas(page2El, { useCORS: true, scale: 2, backgroundColor: '#faf6ef', logging: false }),
      ]);

      restoredStyles.forEach(({ el, origClass }) => { el.className = origClass; });

      page1El.style.width = origWidth1;
      page2El.style.width = origWidth2;
      [...restoredControls1, ...restoredControls2].forEach(({ el, display }) => { el.style.display = display; });
      [...restoredOverflow1, ...restoredOverflow2].forEach(({ el, orig }) => { el.style.overflow = orig; });

      const pdfDoc = await PDFDocument.create();
      const pageWidth = 581;
      const pageHeight = 791;

      const img1Data = canvas1.toDataURL('image/png');
      const img1Bytes = await fetch(img1Data).then(r => r.arrayBuffer());
      const img1 = await pdfDoc.embedPng(img1Bytes);
      const img1Dims = img1.scaleToFit(pageWidth - 20, pageHeight - 20);
      const p1 = pdfDoc.addPage([pageWidth, pageHeight]);
      p1.drawImage(img1, {
        x: (pageWidth - img1Dims.width) / 2,
        y: (pageHeight - img1Dims.height) / 2 + 10,
        width: img1Dims.width,
        height: img1Dims.height,
      });

      const img2Data = canvas2.toDataURL('image/png');
      const img2Bytes = await fetch(img2Data).then(r => r.arrayBuffer());
      const img2 = await pdfDoc.embedPng(img2Bytes);
      const img2Dims = img2.scaleToFit(pageWidth - 20, pageHeight - 20);
      const p2 = pdfDoc.addPage([pageWidth, pageHeight]);
      p2.drawImage(img2, {
        x: (pageWidth - img2Dims.width) / 2,
        y: (pageHeight - img2Dims.height) / 2 + 10,
        width: img2Dims.width,
        height: img2Dims.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeChar.name}_数字人物卡.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('数字卡PDF导出成功！', 'success');
    } catch (e) {
      console.error(e);
      showNotification('数字卡PDF生成失败', 'error');
    }
  };

  if (!activeChar) {
    return (
      <div className="wood-panel p-6 rounded-lg text-center">
        <p className="text-ink-muted">未选择人物卡。</p>
      </div>
    );
  }

  const suspenseFallback = <div className="text-xs text-ink-muted p-4 text-center">加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-surface p-3 rounded border border-wilder-amber">
        <div className="flex flex-wrap gap-2">
          <a
            href="/"
            className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 text-xs text-ink flex items-center gap-1 whitespace-nowrap"
          >
            <ArrowLeft size={14} /> 返回列表
          </a>
          <button
            onClick={() => handleJsonExport(activeChar)}
            className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 text-xs text-ink flex items-center gap-1 whitespace-nowrap"
          >
            <Download size={14} /> 导出 JSON
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 text-xs text-ink flex items-center gap-1 whitespace-nowrap"
          >
            <FileDown size={14} /> 导出 PDF
          </button>
        </div>
      </div>

      <div
        ref={cardPrintRef}
        className="wilder-dot-bg p-2 sm:p-4 md:p-8 rounded-lg shadow-rough-lg border-3 border-surface-border flex flex-col gap-6 print:p-0 print:border-0 print:shadow-none"
      >
        <SheetPage1
          activeChar={activeChar}
          selectedRollStyle={selectedRollStyle}
          setSelectedRollStyle={setSelectedRollStyle}
          selectedRollSkill={selectedRollSkill}
          setSelectedRollSkill={setSelectedRollSkill}
          setIsDiceDrawerOpen={setIsDiceDrawerOpen}
          showNotification={showNotification}
          updateActiveCharStyle={updateActiveCharStyle}
          updateActiveCharSkill={updateActiveCharSkill}
          updateActiveCharStat={updateActiveCharStat}
          setPickerModal={setPickerModal}
          setPickerSearch={setPickerSearch}
          setIsStateModalOpen={setIsStateModalOpen}
          setPendingState={setPendingState}
          setPendingStateLevel={setPendingStateLevel}
          characters={characters}
          setCharacters={setCharacters}
          setSelectedCharId={setSelectedCharId}
          saveCustomCharacters={saveCustomCharacters}
        />
        <SheetPage2
          activeChar={activeChar}
          updateActiveCharStat={updateActiveCharStat}
          setEditPortraitType={setEditPortraitType}
          setEditPortraitValue={setEditPortraitValue}
          setIsPortraitEditMode={setIsPortraitEditMode}
          setIsPortraitModalOpen={setIsPortraitModalOpen}
        />
      </div>

      {isDiceDrawerOpen && (
        <div onClick={() => { setIsDiceDrawerOpen(false); }} className="fixed inset-0 bg-stone-950/60 z-30 transition-opacity animate-fade-in print:hidden" />
      )}

      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 print:hidden">
        <button
          onClick={() => { setIsDiceDrawerOpen(!isDiceDrawerOpen); }}
          className="w-14 h-14 bg-wilder-blue border-3 border-surface-border hover:bg-wilder-blue rounded-full flex flex-col items-center justify-center text-white shadow-rough-md transition-all active:translate-x-0.5 active:translate-y-0.5 group relative"
        >
          <Dice5 size={22} className="group-hover:rotate-45 transition-transform" />
          <span className="text-[9px] font-bold mt-0.5 select-none">进行检定</span>
          <span className="absolute right-16 bg-surface-dark text-white px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-surface-border">打开掷骰检定面板</span>
        </button>
      </div>

      {isDiceDrawerOpen && (
        <Suspense fallback={suspenseFallback}>
          <DiceDrawer
            isDiceDrawerOpen={isDiceDrawerOpen}
            setIsDiceDrawerOpen={setIsDiceDrawerOpen}
            activeChar={activeChar}
            selectedRollStyle={selectedRollStyle}
            setSelectedRollStyle={setSelectedRollStyle}
            selectedRollSkill={selectedRollSkill}
            setSelectedRollSkill={setSelectedRollSkill}
            actionDieMode={actionDieMode}
            setActionDieMode={setActionDieMode}
            diceRoll={diceRoll}
            handleRollDice={handleRollDice}
            toggleDiceActive={toggleDiceActive}
            showNotification={showNotification}
          />
        </Suspense>
      )}

      <Suspense fallback={suspenseFallback}>
        <PickerModal
          pickerModal={pickerModal}
          setPickerModal={setPickerModal}
          activeChar={activeChar}
          characters={characters}
          setCharacters={setCharacters}
          saveCustomCharacters={saveCustomCharacters}
          showNotification={showNotification}
          setSelectedCharId={setSelectedCharId}
          pickerSearch={pickerSearch}
          setPickerSearch={setPickerSearch}
        />
      </Suspense>

      <Suspense fallback={suspenseFallback}>
        <ExportModal
          isExportModalOpen={isExportModalOpen}
          setIsExportModalOpen={setIsExportModalOpen}
          exportBlankTemplatePdf={exportBlankTemplatePdf}
          exportWebRenderPdf={exportWebRenderPdf}
        />
      </Suspense>

      <Suspense fallback={suspenseFallback}>
        <StateModal
          isStateModalOpen={isStateModalOpen}
          setIsStateModalOpen={setIsStateModalOpen}
          activeChar={activeChar}
          characters={characters}
          setCharacters={setCharacters}
          saveCustomCharacters={saveCustomCharacters}
          showNotification={showNotification}
          appendixSearchQuery={appendixSearchQuery}
          pendingState={pendingState}
          setPendingState={setPendingState}
          pendingStateLevel={pendingStateLevel}
          setPendingStateLevel={setPendingStateLevel}
          setSelectedCharId={setSelectedCharId}
        />
      </Suspense>

      <Suspense fallback={suspenseFallback}>
        <PortraitModal
          isPortraitModalOpen={isPortraitModalOpen}
          setIsPortraitModalOpen={setIsPortraitModalOpen}
          setIsPortraitEditMode={setIsPortraitEditMode}
          activeChar={activeChar}
          characters={characters}
          setCharacters={setCharacters}
          saveCustomCharacters={saveCustomCharacters}
          showNotification={showNotification}
          setSelectedCharId={setSelectedCharId}
          editPortraitType={editPortraitType}
          setEditPortraitType={setEditPortraitType}
          editPortraitValue={editPortraitValue}
          setEditPortraitValue={setEditPortraitValue}
          handlePortraitUpload={handlePortraitUpload}
          openPortraitDrawingModal={openPortraitDrawingModal}
        />
      </Suspense>

      <Suspense fallback={suspenseFallback}>
        <DrawingCanvasModal
          isDrawingModalOpen={isDrawingModalOpen}
          setIsDrawingModalOpen={setIsDrawingModalOpen}
          isPortraitEditMode={isPortraitEditMode}
          setIsPortraitModalOpen={setIsPortraitModalOpen}
          drawing={drawing}
          saveBackgroundDrawing={saveBackgroundDrawing}
        />
      </Suspense>

    </div>
  );
}