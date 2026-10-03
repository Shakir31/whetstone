import type * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: dried-blood fill, once per screen. secondary (default): iron outline. ghost: text only. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** md (default) is 44px tall; sm is 32px. */
  size?: 'md' | 'sm';
  /** Fill the container width. */
  block?: boolean;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** Turns the border blood and the hint into the error message. */
  error?: boolean;
}
export declare function TextInput(props: TextInputProps): React.ReactElement;

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: boolean;
  /** Show a character counter ("143 / 2000" with maxLength). */
  showCount?: boolean;
}
export declare function TextArea(props: TextAreaProps): React.ReactElement;

export interface PanelProps {
  title?: React.ReactNode;
  /** Small uppercase context line above the title, e.g. "Day 113 · Tuesday". */
  eyebrow?: React.ReactNode;
  /** Right-aligned header content: a Tag or a small Button. */
  actions?: React.ReactNode;
  /** Chipped, chamfered corners. Default true. */
  worn?: boolean;
  as?: 'section' | 'article' | 'div';
  className?: string;
  children?: React.ReactNode;
}
export declare function Panel(props: PanelProps): React.ReactElement;

export interface StatBarProps {
  name: 'Body' | 'Mind' | 'Will' | string;
  level?: number;
  /** Progress to the next level, 0–100. */
  value: number;
  /** Previous progress; the bar fills from here. Default 0. */
  from?: number;
  /** Replaces the "to Lv. N" footer text. */
  caption?: React.ReactNode;
  /** Thin bar, no footer. */
  compact?: boolean;
  /** blood (default) or iron for a dormant stat. */
  tone?: 'blood' | 'iron';
  /** Fill on mount. Default true. */
  animate?: boolean;
  className?: string;
}
export declare function StatBar(props: StatBarProps): React.ReactElement;

export interface LevelUpProps {
  stat?: string;
  from?: number;
  to?: number;
  /** One line in the System's voice. */
  note?: React.ReactNode;
  /** Default "Level up". */
  word?: React.ReactNode;
  className?: string;
}
export declare function LevelUp(props: LevelUpProps): React.ReactElement;

export interface SystemAward { stat: string; amount: React.ReactNode; positive?: boolean }
export interface SystemMessageProps {
  kind?: 'notice' | 'verdict' | 'warning';
  /** Overrides the "System · Verdict" label. */
  label?: React.ReactNode;
  /** Right-aligned, e.g. "Day 113 · 23:52". */
  meta?: React.ReactNode;
  title?: React.ReactNode;
  /** The italic one-line judgement. */
  verdict?: React.ReactNode;
  awards?: SystemAward[];
  className?: string;
  children?: React.ReactNode;
}
export declare function SystemMessage(props: SystemMessageProps): React.ReactElement;

export interface NavItem { id: string; label: string; icon?: 'journal' | 'chronicle' | 'stats' | 'settings'; href?: string }
export interface NavProps {
  /** Defaults to Journal, Chronicle, Stats, Settings. */
  items?: NavItem[];
  active?: string;
  onNavigate?: (id: string) => void;
  /** auto (default): bar above 640px, fixed bottom tabs at 640px and below. */
  layout?: 'auto' | 'bar' | 'tabs';
  /** Wordmark text; false hides it. */
  brand?: React.ReactNode | false;
  brandHref?: string;
  className?: string;
}
export declare function Nav(props: NavProps): React.ReactElement;

export interface TagProps { tone?: 'neutral' | 'iron' | 'blood' | 'bone'; className?: string; children?: React.ReactNode }
export declare function Tag(props: TagProps): React.ReactElement;

export interface DividerProps { variant?: 'plain' | 'heavy' | 'ornament'; label?: React.ReactNode; className?: string }
export declare function Divider(props: DividerProps): React.ReactElement;

export interface SurfaceProps { as?: 'div' | 'main' | 'body'; grain?: boolean; vignette?: boolean; style?: React.CSSProperties; className?: string; children?: React.ReactNode }
export declare function Surface(props: SurfaceProps): React.ReactElement;

declare global {
  interface Window {
    Whetstone: {
      Button: typeof Button; TextInput: typeof TextInput; TextArea: typeof TextArea; Panel: typeof Panel;
      StatBar: typeof StatBar; LevelUp: typeof LevelUp; SystemMessage: typeof SystemMessage; Nav: typeof Nav;
      Tag: typeof Tag; Divider: typeof Divider; Surface: typeof Surface;
    };
  }
}
