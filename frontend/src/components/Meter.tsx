import React from "react";

export type MeterState = "ok" | "watch" | "alert";

interface MeterProps {
  label: string;
  value: number;
  max: number;
  /** Rendered verbatim beside the label, e.g. "87/100" */
  display: string;
  /** Judgment shown as a word — color alone never carries it */
  state: MeterState;
  /**
   * Vocabulary for the state word. "CRITICAL" is right for a risk meter and
   * wrong for a confidence one, so each meter names its own scale.
   */
  words?: Record<MeterState, string>;
  segments?: number;
}

const DEFAULT_WORDS: Record<MeterState, string> = {
  ok: "NOMINAL",
  watch: "ELEVATED",
  alert: "CRITICAL",
};

export const QUALITY_WORDS: Record<MeterState, string> = {
  ok: "STRONG",
  watch: "PARTIAL",
  alert: "WEAK",
};

export const CONFIDENCE_WORDS: Record<MeterState, string> = {
  ok: "HIGH",
  watch: "MEDIUM",
  alert: "LOW",
};

const STATE_INK: Record<MeterState, string> = {
  ok: "text-ok",
  watch: "text-accent",
  alert: "text-danger",
};

/**
 * Single-hue segmented readout. Length carries magnitude; the state word
 * carries the judgment.
 *
 * The fill is deliberately always amber rather than green/amber/red:
 * amber and green are indistinguishable to red-green colorblind viewers
 * (measured ΔE 3-5), so a hue-coded meter would be unreadable for them.
 * The verdict therefore rides on the state word plus the numeric display.
 */
const Meter: React.FC<MeterProps> = ({
  label,
  value,
  max,
  display,
  state,
  words = DEFAULT_WORDS,
  segments = 20,
}) => {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const filled = Math.round(ratio * segments);
  const word = words[state];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2 gap-3">
        <span className="label">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className={`text-[10px] tracking-[0.18em] ${STATE_INK[state]}`}>
            {word}
          </span>
          <span className="text-sm text-ink tabular-nums">{display}</span>
        </div>
      </div>

      <div
        className="flex gap-[2px] h-2"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${display}, ${word}`}
      >
        {Array.from({ length: segments }, (_, i) => (
          <div
            key={i}
            className={`flex-1 ${
              i < filled ? "bg-accent" : "bg-line/15"
            } transition-colors duration-300`}
          />
        ))}
      </div>
    </div>
  );
};

export default Meter;
