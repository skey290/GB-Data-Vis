"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chips } from "@/components/ui/chips";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/lib/sprite-icon";

export type GoalPostingFrequency = "Day" | "Week" | "Month";
export type GoalTimeframe = "1 month" | "3 months" | "6 months" | "1 year";

const POSTING_FREQUENCIES: readonly GoalPostingFrequency[] = [
  "Day",
  "Week",
  "Month",
];
const TIMEFRAMES: readonly GoalTimeframe[] = [
  "1 month",
  "3 months",
  "6 months",
  "1 year",
];

/** Figma `Targeted Followers` 슬라이더 스케일 레이블 6개 */
export const TARGETED_FOLLOWERS_LABELS = [
  "1,000",
  "5,000",
  "10,000",
  "50,000",
  "1M",
  "1M+",
] as const;

export interface GoalSettingAction {
  id: string;
  /** Gabrielle accordion 액션 행의 출처 Badge 라벨 (예: "Assets", "Content Studio") */
  category: string;
  label: string;
  onRun?: () => void;
}

export interface GoalSettingProps {
  onClose?: () => void;
  className?: string;

  /** 제어 컴포넌트로 사용할 때의 "Known for Now" 값 */
  now?: string;
  /** 비제어 컴포넌트로 사용할 때의 초기값 */
  defaultNow?: string;
  onNowChange?: (value: string) => void;
  /** Gabrielle accordion에 나열할 추천 액션. 빈 배열/미지정 시 아코디언을 숨깁니다 */
  nowActions?: GoalSettingAction[];

  /** 제어 컴포넌트로 사용할 때의 "Known for Next" 값 */
  goal?: string;
  /** 비제어 컴포넌트로 사용할 때의 초기값 */
  defaultGoal?: string;
  onGoalChange?: (value: string) => void;
  goalActions?: GoalSettingAction[];

  /** 제어 컴포넌트로 사용할 때의 Posting 카운터 값 */
  postingCount?: number;
  defaultPostingCount?: number;
  onPostingCountChange?: (value: number) => void;

  postingFrequency?: GoalPostingFrequency;
  defaultPostingFrequency?: GoalPostingFrequency;
  onPostingFrequencyChange?: (value: GoalPostingFrequency) => void;

  /** `TARGETED_FOLLOWERS_LABELS` 인덱스(0~5) */
  targetedFollowersIndex?: number;
  defaultTargetedFollowersIndex?: number;
  onTargetedFollowersIndexChange?: (index: number) => void;

  timeframe?: GoalTimeframe;
  defaultTimeframe?: GoalTimeframe;
  onTimeframeChange?: (value: GoalTimeframe) => void;
}

const ROOT_CLASS = cn(
  "flex w-[560px] flex-col items-stretch gap-[var(--gb-spacing-7)]",
  "rounded-[var(--gb-radius-scale-3xl)] p-[var(--gb-spacing-8)]",
  "border-[length:var(--gb-border-1)] border-solid border-[var(--gb-border-subtler)]",
  "bg-[var(--gb-background-default)] shadow-[var(--gb-shadow-lg)]",
);

export const STATEMENT_BOX_CLASS =
  "rounded-[var(--gb-radius-scale-lg)] border-[length:var(--gb-border-1)] border-solid border-[var(--gb-border-default)] bg-[var(--gb-background-surface)] p-[var(--gb-spacing-4)]";

const NOW_PLACEHOLDER =
  "What are you known for today? Share your experience, past work, or what people already know you for.";
const GOAL_PLACEHOLDER =
  "What do you want to be known for next? Describe the position and audience you're aiming for.";

function activateOnKey(event: React.KeyboardEvent, callback: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

function SectionHeader({
  title,
  onEdit,
}: {
  title: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-base-bold text-[var(--gb-text-default)]">{title}</p>
      <Button
        type="button"
        variant="icon-ghost"
        icon={<Icon id="pen-icon" />}
        aria-label={`${title} 편집`}
        onClick={onEdit}
      />
    </div>
  );
}

function Divider({ tone = "subtler" }: { tone?: "subtler" | "bold" }) {
  return (
    <div
      className={cn(
        "h-[length:var(--gb-border-1)] w-full",
        tone === "bold"
          ? "bg-[var(--gb-border-bold)]"
          : "bg-[var(--gb-border-subtler)]",
      )}
    />
  );
}

function SentenceChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Chips variant="outline" selected={selected} onClick={onClick}>
      {children}
    </Chips>
  );
}

export function SettingsSentence({
  postingCount,
  postingFrequency,
  targetedFollowersIndex,
  timeframe,
  openPanel = null,
  onOpenFrequency,
  onOpenFollowers,
  onOpenTimeframe,
}: {
  postingCount: number;
  postingFrequency: GoalPostingFrequency;
  targetedFollowersIndex: number;
  timeframe: GoalTimeframe;
  openPanel?: SettingsPanelKind;
  onOpenFrequency?: () => void;
  onOpenFollowers?: () => void;
  onOpenTimeframe?: () => void;
}) {
  const frequencyLabel = `${postingCount} time${postingCount === 1 ? "" : "s"} a ${postingFrequency.toLowerCase()}`;
  const followersLabel =
    TARGETED_FOLLOWERS_LABELS[targetedFollowersIndex] ??
    TARGETED_FOLLOWERS_LABELS[0];

  return (
    <p className="flex w-full flex-wrap items-center gap-[var(--gb-spacing-1)] text-base-regular text-[var(--gb-text-default)]">
      <span>I post</span>
      <SentenceChip
        selected={openPanel === "frequency"}
        onClick={onOpenFrequency}
      >
        {frequencyLabel}
      </SentenceChip>
      <span>, aiming for</span>
      <SentenceChip
        selected={openPanel === "followers"}
        onClick={onOpenFollowers}
      >
        {followersLabel}
      </SentenceChip>
      <span>followers, within</span>
      <SentenceChip
        selected={openPanel === "timeframe"}
        onClick={onOpenTimeframe}
      >
        {timeframe}
      </SentenceChip>
      <span>.</span>
    </p>
  );
}

function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  formatOption,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  formatOption?: (option: T) => string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-full items-center gap-[var(--gb-spacing-2)]"
    >
      {options.map((option) => {
        const isSelected = option === value;
        return (
          <Button
            key={option}
            type="button"
            variant="outline"
            role="radio"
            aria-checked={isSelected}
            isSelected={isSelected}
            onClick={() => onChange(option)}
            className="flex-1"
          >
            {formatOption ? formatOption(option) : option}
          </Button>
        );
      })}
    </div>
  );
}

function SettingsPanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-[var(--gb-spacing-4)] rounded-[var(--gb-radius-scale-3xl)] border border-dashed border-[var(--gb-border-bold)] px-[var(--gb-spacing-4)] pt-[var(--gb-spacing-4)] pb-[var(--gb-spacing-6)] shadow-[var(--gb-shadow-lg)]">
      <div className="flex w-full items-center gap-[var(--gb-spacing-3)]">
        <p className="flex-1 text-sm-semi-bold text-[var(--gb-text-default)]">
          {title}
        </p>
        <Button
          type="button"
          variant="icon-ghost"
          icon={<Icon id="x-icon" />}
          aria-label="닫기"
          onClick={onClose}
        />
      </div>
      {children}
    </div>
  );
}

function FrequencyPanel({
  count,
  frequency,
  onCountChange,
  onFrequencyChange,
  onClose,
}: {
  count: number;
  frequency: GoalPostingFrequency;
  onCountChange: (value: number) => void;
  onFrequencyChange: (value: GoalPostingFrequency) => void;
  onClose: () => void;
}) {
  return (
    <SettingsPanel title="Posting Frequency" onClose={onClose}>
      <div className="flex w-full items-center gap-[var(--gb-spacing-3)]">
        <div className="flex shrink-0 items-center gap-[var(--gb-spacing-2)]">
          <Button
            type="button"
            variant="icon-rounded"
            icon={<Icon id="minus-icon" />}
            aria-label="감소"
            onClick={() => onCountChange(Math.max(1, count - 1))}
            className="size-[24px]"
          />
          <span className="w-[40px] text-center text-sm-semi-bold text-[var(--gb-text-default)]">
            {count}
          </span>
          <Button
            type="button"
            variant="icon-rounded"
            icon={<Icon id="plus-icon" />}
            aria-label="증가"
            onClick={() => onCountChange(count + 1)}
            className="size-[24px]"
          />
          <span className="text-xs-medium whitespace-nowrap text-[var(--gb-text-default)]">
            time(s)
          </span>
        </div>
        <ToggleGroup
          label="Posting Frequency"
          options={POSTING_FREQUENCIES}
          value={frequency}
          onChange={onFrequencyChange}
          formatOption={(option) => `a ${option}`}
        />
      </div>
    </SettingsPanel>
  );
}

function FollowersPanel({
  index,
  onIndexChange,
  onClose,
}: {
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <SettingsPanel title="Targeted Followers" onClose={onClose}>
      <div className="flex w-full flex-col gap-[var(--gb-spacing-2)]">
        <Slider
          value={index}
          onValueChange={onIndexChange}
          min={0}
          max={TARGETED_FOLLOWERS_LABELS.length - 1}
          step={1}
          aria-label="Targeted Followers"
          shouldFitContainer
        />
        <div className="relative h-[var(--gb-spacing-4)] w-full">
          {TARGETED_FOLLOWERS_LABELS.map((label, labelIndex) => {
            const isFirst = labelIndex === 0;
            const isLast = labelIndex === TARGETED_FOLLOWERS_LABELS.length - 1;
            return (
              <span
                key={label}
                style={{
                  left: `${(labelIndex / (TARGETED_FOLLOWERS_LABELS.length - 1)) * 100}%`,
                }}
                className={cn(
                  "text-xs-medium absolute whitespace-nowrap text-[var(--gb-text-default)]",
                  isFirst
                    ? "translate-x-0"
                    : isLast
                      ? "-translate-x-full"
                      : "-translate-x-1/2",
                )}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </SettingsPanel>
  );
}

function TimeframePanel({
  value,
  onChange,
  onClose,
}: {
  value: GoalTimeframe;
  onChange: (value: GoalTimeframe) => void;
  onClose: () => void;
}) {
  return (
    <SettingsPanel title="Timeframe" onClose={onClose}>
      <ToggleGroup
        label="Timeframe"
        options={TIMEFRAMES}
        value={value}
        onChange={onChange}
      />
    </SettingsPanel>
  );
}

function GabrielleAccordion({
  actions,
  open,
  onToggle,
}: {
  actions: GoalSettingAction[];
  open: boolean;
  onToggle: () => void;
}) {
  if (actions.length === 0) return null;
  const shown = actions.slice(0, 3);
  const moreCount = actions.length - shown.length;

  return (
    <div className="flex w-full flex-col items-start gap-[var(--gb-spacing-3)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-[var(--gb-radius-scale-full)] px-[var(--gb-spacing-3)] py-[var(--gb-spacing-1)]"
      >
        <span className="flex items-center gap-[var(--gb-spacing-2-5)]">
          <Icon
            id="sparkles-icon"
            className="size-[16px] text-[var(--gb-text-default)]"
          />
          <span className="text-sm-regular text-[var(--gb-text-default)]">
            Gabrielle suggests {actions.length} action
            {actions.length === 1 ? "" : "s"}
          </span>
          <Badge variant="alarm" size="20">
            Needs approval
          </Badge>
        </span>
        <Icon
          id={open ? "chevron-up-icon" : "chevron-down-icon"}
          className="size-[16px] text-[var(--gb-text-default)]"
        />
      </button>
      {open && (
        <div className="flex w-full flex-col gap-[var(--gb-spacing-1)] rounded-[var(--gb-radius-scale-xl)] border border-dashed border-[var(--gb-border-invert)] p-[var(--gb-spacing-3-5)]">
          {shown.map((action) => (
            <div
              key={action.id}
              className="flex w-full items-center gap-[var(--gb-spacing-2-5)]"
            >
              <Badge variant="outline" size="20">
                {action.category}
              </Badge>
              <p className="flex-1 text-sm-medium text-[var(--gb-text-subtle)]">
                {action.label}
              </p>
              <Button type="button" variant="outline" onClick={action.onRun}>
                Run
              </Button>
            </div>
          ))}
          {moreCount > 0 && (
            <p className="text-xs-medium text-[var(--gb-text-subtler)]">
              + {moreCount} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}

type SettingsPanelKind = "frequency" | "followers" | "timeframe" | null;

interface GoalDraft {
  text: string;
  postingCount: number;
  postingFrequency: GoalPostingFrequency;
  targetedFollowersIndex: number;
  timeframe: GoalTimeframe;
}

export function GoalSetting({
  onClose,
  className,
  now,
  defaultNow = "",
  onNowChange,
  nowActions = [],
  goal,
  defaultGoal = "",
  onGoalChange,
  goalActions = [],
  postingCount,
  defaultPostingCount = 3,
  onPostingCountChange,
  postingFrequency,
  defaultPostingFrequency = "Day",
  onPostingFrequencyChange,
  targetedFollowersIndex,
  defaultTargetedFollowersIndex = 1,
  onTargetedFollowersIndexChange,
  timeframe,
  defaultTimeframe = "1 year",
  onTimeframeChange,
}: GoalSettingProps) {
  const [uncontrolledNow, setUncontrolledNow] = React.useState(defaultNow);
  const currentNow = now ?? uncontrolledNow;
  const handleNowChange = (value: string) => {
    if (now === undefined) setUncontrolledNow(value);
    onNowChange?.(value);
  };

  const [uncontrolledGoal, setUncontrolledGoal] = React.useState(defaultGoal);
  const currentGoal = goal ?? uncontrolledGoal;
  const handleGoalChange = (value: string) => {
    if (goal === undefined) setUncontrolledGoal(value);
    onGoalChange?.(value);
  };

  const [uncontrolledPostingCount, setUncontrolledPostingCount] =
    React.useState(defaultPostingCount);
  const currentPostingCount = postingCount ?? uncontrolledPostingCount;
  const handlePostingCountChange = (value: number) => {
    if (postingCount === undefined) setUncontrolledPostingCount(value);
    onPostingCountChange?.(value);
  };

  const [uncontrolledPostingFrequency, setUncontrolledPostingFrequency] =
    React.useState(defaultPostingFrequency);
  const currentPostingFrequency =
    postingFrequency ?? uncontrolledPostingFrequency;
  const handlePostingFrequencyChange = (value: GoalPostingFrequency) => {
    if (postingFrequency === undefined) setUncontrolledPostingFrequency(value);
    onPostingFrequencyChange?.(value);
  };

  const [
    uncontrolledTargetedFollowersIndex,
    setUncontrolledTargetedFollowersIndex,
  ] = React.useState(defaultTargetedFollowersIndex);
  const currentTargetedFollowersIndex =
    targetedFollowersIndex ?? uncontrolledTargetedFollowersIndex;
  const handleTargetedFollowersIndexChange = (index: number) => {
    if (targetedFollowersIndex === undefined)
      setUncontrolledTargetedFollowersIndex(index);
    onTargetedFollowersIndexChange?.(index);
  };

  const [uncontrolledTimeframe, setUncontrolledTimeframe] =
    React.useState(defaultTimeframe);
  const currentTimeframe = timeframe ?? uncontrolledTimeframe;
  const handleTimeframeChange = (value: GoalTimeframe) => {
    if (timeframe === undefined) setUncontrolledTimeframe(value);
    onTimeframeChange?.(value);
  };

  const [editingSection, setEditingSection] = React.useState<
    "now" | "goal" | null
  >(null);
  const [nowDraft, setNowDraft] = React.useState("");
  const [goalDraft, setGoalDraft] = React.useState<GoalDraft>({
    text: "",
    postingCount: defaultPostingCount,
    postingFrequency: defaultPostingFrequency,
    targetedFollowersIndex: defaultTargetedFollowersIndex,
    timeframe: defaultTimeframe,
  });
  const [openPanel, setOpenPanel] = React.useState<SettingsPanelKind>(null);

  const [nowAccordionOpen, setNowAccordionOpen] = React.useState(false);
  const [goalAccordionOpen, setGoalAccordionOpen] = React.useState(false);

  const enterNowEdit = () => {
    setNowDraft(currentNow);
    setEditingSection("now");
  };
  const cancelNowEdit = () => setEditingSection(null);
  const saveNowEdit = () => {
    handleNowChange(nowDraft);
    setEditingSection(null);
  };

  const enterGoalEdit = () => {
    setGoalDraft({
      text: currentGoal,
      postingCount: currentPostingCount,
      postingFrequency: currentPostingFrequency,
      targetedFollowersIndex: currentTargetedFollowersIndex,
      timeframe: currentTimeframe,
    });
    setOpenPanel(null);
    setEditingSection("goal");
  };
  const cancelGoalEdit = () => {
    setEditingSection(null);
    setOpenPanel(null);
  };
  const saveGoalEdit = () => {
    handleGoalChange(goalDraft.text);
    handlePostingCountChange(goalDraft.postingCount);
    handlePostingFrequencyChange(goalDraft.postingFrequency);
    handleTargetedFollowersIndexChange(goalDraft.targetedFollowersIndex);
    handleTimeframeChange(goalDraft.timeframe);
    setEditingSection(null);
    setOpenPanel(null);
  };

  const togglePanel = (panel: Exclude<SettingsPanelKind, null>) =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  const isEditingNow = editingSection === "now";
  const isEditingGoal = editingSection === "goal";
  const hasGoalSettings = currentGoal.trim().length > 0;

  return (
    <div className={cn(ROOT_CLASS, className)}>
      <div className="flex w-full items-center justify-between">
        <p className="text-xl-black text-[var(--gb-text-default)]">My goal</p>
        <Button
          type="button"
          variant="icon-ghost"
          icon={<Icon id="x-icon" />}
          aria-label="닫기"
          onClick={onClose}
        />
      </div>

      <div className="flex w-full flex-col items-center gap-[var(--gb-spacing-4)]">
        <div className="flex w-full flex-col items-start gap-[var(--gb-spacing-2)]">
          <SectionHeader title="Known for Now" onEdit={enterNowEdit} />
          {isEditingNow ? (
            <div className="flex w-full flex-col items-start gap-[var(--gb-spacing-3)]">
              <Textarea
                aria-label="Known for Now"
                value={nowDraft}
                onValueChange={setNowDraft}
                shouldFitContainer
                autoFocus
              />
              <div className="flex w-full items-start justify-end gap-[var(--gb-spacing-2)]">
                <Button type="button" variant="outline" onClick={cancelNowEdit}>
                  Cancel
                </Button>
                <Button type="button" variant="primary" onClick={saveNowEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col items-start gap-[var(--gb-spacing-1)]">
              <div
                role="button"
                tabIndex={0}
                onClick={enterNowEdit}
                onKeyDown={(event) => activateOnKey(event, enterNowEdit)}
                className={cn(
                  STATEMENT_BOX_CLASS,
                  "w-full cursor-pointer text-left",
                )}
              >
                <p className="text-base-regular text-[var(--gb-text-default)]">
                  {currentNow || NOW_PLACEHOLDER}
                </p>
              </div>
              <GabrielleAccordion
                actions={nowActions}
                open={nowAccordionOpen}
                onToggle={() => setNowAccordionOpen((prev) => !prev)}
              />
            </div>
          )}
        </div>

        <Divider />

        <div className="flex w-full flex-col items-start gap-[var(--gb-spacing-2)]">
          <SectionHeader title="Known for Next" onEdit={enterGoalEdit} />
          {isEditingGoal ? (
            <div className="flex w-full flex-col items-start gap-[var(--gb-spacing-3)]">
              <div
                className={cn(
                  STATEMENT_BOX_CLASS,
                  "flex w-full flex-col items-start gap-[var(--gb-spacing-3)]",
                )}
              >
                <Textarea
                  aria-label="Known for Next"
                  value={goalDraft.text}
                  onValueChange={(value) =>
                    setGoalDraft((draft) => ({ ...draft, text: value }))
                  }
                  shouldFitContainer
                  autoFocus
                />
                {hasGoalSettings && (
                  <>
                    <Divider tone="bold" />
                    <SettingsSentence
                      postingCount={goalDraft.postingCount}
                      postingFrequency={goalDraft.postingFrequency}
                      targetedFollowersIndex={goalDraft.targetedFollowersIndex}
                      timeframe={goalDraft.timeframe}
                      openPanel={openPanel}
                      onOpenFrequency={() => togglePanel("frequency")}
                      onOpenFollowers={() => togglePanel("followers")}
                      onOpenTimeframe={() => togglePanel("timeframe")}
                    />
                    {openPanel === "frequency" && (
                      <FrequencyPanel
                        count={goalDraft.postingCount}
                        frequency={goalDraft.postingFrequency}
                        onCountChange={(value) =>
                          setGoalDraft((draft) => ({
                            ...draft,
                            postingCount: value,
                          }))
                        }
                        onFrequencyChange={(value) =>
                          setGoalDraft((draft) => ({
                            ...draft,
                            postingFrequency: value,
                          }))
                        }
                        onClose={() => setOpenPanel(null)}
                      />
                    )}
                    {openPanel === "followers" && (
                      <FollowersPanel
                        index={goalDraft.targetedFollowersIndex}
                        onIndexChange={(index) =>
                          setGoalDraft((draft) => ({
                            ...draft,
                            targetedFollowersIndex: index,
                          }))
                        }
                        onClose={() => setOpenPanel(null)}
                      />
                    )}
                    {openPanel === "timeframe" && (
                      <TimeframePanel
                        value={goalDraft.timeframe}
                        onChange={(value) =>
                          setGoalDraft((draft) => ({
                            ...draft,
                            timeframe: value,
                          }))
                        }
                        onClose={() => setOpenPanel(null)}
                      />
                    )}
                  </>
                )}
              </div>
              <div className="flex w-full items-start justify-end gap-[var(--gb-spacing-2)]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelGoalEdit}
                >
                  Cancel
                </Button>
                <Button type="button" variant="primary" onClick={saveGoalEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col items-start gap-[var(--gb-spacing-1)]">
              <div
                role="button"
                tabIndex={0}
                onClick={enterGoalEdit}
                onKeyDown={(event) => activateOnKey(event, enterGoalEdit)}
                className={cn(
                  STATEMENT_BOX_CLASS,
                  "flex w-full cursor-pointer flex-col items-start gap-[var(--gb-spacing-3)] text-left",
                )}
              >
                <p className="text-base-regular text-[var(--gb-text-default)]">
                  {currentGoal || GOAL_PLACEHOLDER}
                </p>
                {hasGoalSettings && (
                  <>
                    <Divider tone="bold" />
                    <SettingsSentence
                      postingCount={currentPostingCount}
                      postingFrequency={currentPostingFrequency}
                      targetedFollowersIndex={currentTargetedFollowersIndex}
                      timeframe={currentTimeframe}
                    />
                  </>
                )}
              </div>
              <GabrielleAccordion
                actions={goalActions}
                open={goalAccordionOpen}
                onToggle={() => setGoalAccordionOpen((prev) => !prev)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
