import type {FC, CSSProperties} from "react";
import {Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import brand from "./brand.generated";
import timing from "./koubo-timing.json";

/**
 * 通用口播视频（9:16）。
 *
 * 这一段是 **video-factory 模板代码**，由 `scripts/sync-template.mjs` 同步到各产品工程，**不要在实例里改**。
 * 要改品牌 → 改实例的 `brand-kit.json` 再重新生成 `brand.generated.ts`；
 * 要改节奏/文案 → 改 `koubo-lines.json` 重跑配音（koubo-video skill）生成 `koubo-timing.json`。
 */

type Line = {text: string; from: number; dur: number};
const LINES = timing.lines as Line[];
const TOTAL = timing.totalFrames;
const C = brand.c;

/** 尾段落版从第几句开始（最后两句：品牌名 + CTA） */
const OUTRO_FROM = LINES.length - 2;

/** 按字数选字号，保证不溢出安全区 */
const sizeFor = (t: string) => {
  const n = t.length;
  const s = brand.fontSizes;
  if (n <= 7) return s.xl;
  if (n <= 10) return s.lg;
  if (n <= 14) return s.md;
  return s.sm;
};

const SAFE_X = brand.safeX;

/** 单句字幕：当前句放大，前后句压暗，形成提词器式的上下文 */
const LineText: FC<{line: Line; role: "prev" | "now" | "next"}> = ({line, role}) => {
  const frame = useCurrentFrame();
  const size = sizeFor(line.text);
  const style: CSSProperties = {
    fontFamily: brand.fontFamily,
    fontWeight: role === "now" ? 700 : 500,
    fontSize: role === "now" ? size : brand.contextFontSize,
    lineHeight: 1.42,
    color: role === "now" ? C.text : C.text4,
    textAlign: "center",
    maxWidth: 1080 - SAFE_X * 2,
  };
  if (role !== "now") return <div style={style}>{line.text}</div>;

  const p = interpolate(frame, [line.from, line.from + 11], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        ...style,
        opacity: p,
        transform: `translateY(${(1 - p) * 26}px)`,
        filter: `blur(${(1 - p) * 8}px)`,
        textShadow: `0 ${Math.round(4 + p * 4)}px ${Math.round((1 - p) * 30 + 14)}px rgba(0,0,0,0.55)`,
      }}
    >
      {line.text}
    </div>
  );
};

/**
 * 底部装饰：整支片子推进时逐格点亮。
 * brand.decor.type = "none" → 不渲染（通用默认只留总进度条）
 * brand.decor.type = "cells" → 方格，数量由 brand.decor.count 决定（如 ACME 的 21 天）
 */
const DecorRow: FC<{progress: number}> = ({progress}) => {
  const d = brand.decor;
  if (d.type !== "cells" || !d.count) return null;
  const lit = progress * d.count;
  return (
    <div style={{display: "flex", gap: 8, alignItems: "center"}}>
      {Array.from({length: d.count}, (_, i) => {
        const a = Math.max(0, Math.min(1, lit - i));
        return (
          <div
            key={i}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: `2px solid ${a > 0.05 ? C.primary : C.trackBorder}`,
              background: a > 0.05 ? `${C.cellFill.slice(0, -1)}${(0.2 + 0.75 * a).toFixed(3)})` : "transparent",
              transform: `scale(${0.86 + 0.14 * a})`,
              boxShadow: a > 0.7 ? `0 0 ${18 * a}px ${C.cellGlow.slice(0, -1)}${(0.5 * a).toFixed(3)})` : "none",
            }}
          />
        );
      })}
    </div>
  );
};

/** 品牌落版 */
const Outro: FC<{line: Line}> = ({line}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [line.from, line.from + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 34}}>
      <div
        style={{
          fontFamily: brand.fontFamily,
          fontSize: brand.outroSizes.name,
          fontWeight: 700,
          letterSpacing: 6,
          color: C.primary,
          opacity: p,
          transform: `scale(${0.92 + 0.08 * p})`,
          textShadow: `0 0 ${60 * p}px ${C.glow}`,
        }}
      >
        {brand.name}
      </div>
      <div
        style={{
          width: Math.round(p * 170),
          height: 4,
          background: C.primary,
          borderRadius: 4,
          opacity: 0.85,
        }}
      />
      <div
        style={{
          fontFamily: brand.fontFamily,
          fontSize: brand.outroSizes.cta,
          fontWeight: 600,
          color: C.text2,
          opacity: interpolate(frame, [line.from + 14, line.from + 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {brand.outroCTA}
      </div>
      {brand.aiLabel ? (
        <div
          style={{
            fontFamily: brand.fontFamily,
            fontSize: brand.outroSizes.ai,
            fontWeight: 500,
            letterSpacing: 4,
            color: C.text4,
            opacity: interpolate(frame, [line.from + 22, line.from + 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {brand.aiLabel}
        </div>
      ) : null}
    </div>
  );
};

export const Koubo: FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = Math.min(1, frame / durationInFrames);

  // 当前句索引
  let idx = 0;
  for (let i = 0; i < LINES.length; i++) if (frame >= LINES[i].from) idx = i;
  const isOutro = idx >= OUTRO_FROM;

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: "clamp"});
  const fadeOut = interpolate(frame, [durationInFrames - 22, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily: brand.fontFamily,
        background: `radial-gradient(120% 78% at 50% 112%, ${C.bg0} 0%, ${C.horizon} 34%, ${C.bg1} 68%, ${C.bg2} 100%)`,
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* 底部地平线暖光 */}
      {brand.horizonGlow ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -260,
            width: 1100,
            height: 620,
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.horizonGlowA} 0%, ${C.horizonGlowB} 40%, transparent 70%)`,
            filter: "blur(30px)",
            opacity: 0.55 + 0.45 * progress,
          }}
        />
      ) : null}

      {/* 顶部品牌条 */}
      <div
        style={{
          position: "absolute",
          top: 96,
          left: SAFE_X,
          right: SAFE_X,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 14}}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              border: `2px solid ${C.primaryBorder}`,
              background: C.primarySoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 19,
              color: C.primary,
            }}
          >
            {brand.badge}
          </div>
          <span style={{fontSize: 30, fontWeight: 600, color: C.text3, letterSpacing: 2}}>
            {brand.name}
          </span>
        </div>
        {brand.barRight ? (
          <span style={{fontSize: 26, fontWeight: 500, color: C.text4, letterSpacing: 3}}>
            {brand.barRight}
          </span>
        ) : null}
      </div>

      {/* 主体字幕区 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          padding: `0 ${SAFE_X}px`,
        }}
      >
        {isOutro ? (
          <Outro line={LINES[idx]} />
        ) : (
          <>
            <div style={{height: 60, display: "flex", alignItems: "flex-end"}}>
              {idx > 0 ? <LineText line={LINES[idx - 1]} role="prev" /> : null}
            </div>
            <LineText line={LINES[idx]} role="now" />
            <div style={{height: 60, display: "flex", alignItems: "flex-start"}}>
              {idx < LINES.length - 1 ? <LineText line={LINES[idx + 1]} role="next" /> : null}
            </div>
          </>
        )}
      </div>

      {/* 底部：品牌装饰进度 + 总进度条 */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          bottom: 88,
          display: "flex",
          flexDirection: "column",
          gap: 26,
          alignItems: "center",
        }}
      >
        <DecorRow progress={progress} />
        <div
          style={{
            width: "100%",
            height: 6,
            borderRadius: 6,
            background: C.track,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${C.primary}, ${C.primaryBright})`,
              borderRadius: 6,
            }}
          />
        </div>
      </div>

      <Audio src={staticFile(brand.audioFile)} />
    </div>
  );
};

export {TOTAL as KOUBO_TOTAL};
