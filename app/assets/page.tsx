"use client";

import * as React from "react";
import { Blocks, Compass, Home, UserRoundSearch } from "lucide-react";

import { cn } from "@/lib/utils";
import { createSpriteIcon, Icon } from "@/lib/sprite-icon";
import { Gnb, type GnbItem } from "@/components/app/gnb";
import { FloatingProfile } from "@/components/app/floating-profile";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Chips } from "@/components/ui/chips";
import { Select } from "@/components/ui/select";

const AssetIcon = createSpriteIcon("asset-icon");

const GNB_ITEMS: GnbItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "assets", icon: AssetIcon, label: "Assets" },
  { id: "compass", icon: Compass, label: "Compass" },
  { id: "contents-studio", icon: Blocks, label: "Contents Studio" },
  { id: "know-thyself", icon: UserRoundSearch, label: "Know Thyself" },
];

const SELF_OPTIONS = [{ value: "data-scientist", label: "Data Scientist" }];

/**
 * Slot centers relative to the 420×420 cluster center, with each slot's own
 * rotation. Geometry constants measured from Figma — the radius is not uniform
 * (N/S 166, E/W 157, diagonals ≈156.6), which is kept as drawn.
 */
const SELF_SLOTS = [
  { id: "north", dx: 0, dy: -166, rotate: 0 },
  { id: "north-east", dx: 111.75, dy: -109.8, rotate: 45 },
  { id: "east", dx: 157, dy: 0, rotate: 90 },
  { id: "south-east", dx: 111.75, dy: 109.71, rotate: 135 },
  { id: "south", dx: 0, dy: 166, rotate: 180 },
  { id: "south-west", dx: -111.85, dy: 109.7, rotate: -135 },
  { id: "west", dx: -157, dy: 0, rotate: -90 },
  { id: "north-west", dx: -111.85, dy: -109.8, rotate: -45 },
] as const;

const ASSETS = [
  {
    id: "first-asset",
    src: "/images/personas/self-default.jpg",
    alt: "Data Scientist asset",
    date: "2025.05.17",
  },
];

function DottedBackground() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 opacity-[var(--gb-opacity-50)]",
        "bg-[var(--gb-color-neutral-950)]",
        "bg-[radial-gradient(circle,var(--gb-color-neutral-700)_1px,transparent_1px)]",
        "bg-[length:var(--gb-spacing-6)_var(--gb-spacing-6)]",
      )}
    />
  );
}

function SelfCluster({ onAddSelf }: { onAddSelf?: (slotId: string) => void }) {
  return (
    <div className="relative size-[420px]">
      {SELF_SLOTS.map((slot) => {
        const isFilled = slot.id === "north";

        return (
          <div
            key={slot.id}
            style={{
              transform: `translate(-50%, -50%) translate(${slot.dx}px, ${slot.dy}px) rotate(${slot.rotate}deg)`,
            }}
            className="absolute top-1/2 left-1/2 h-[106px] w-[84px]"
          >
            {isFilled ? (
              <div className="relative size-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/personas/self-default.jpg"
                  alt="Data Scientist"
                  className="size-full rounded-[var(--gb-radius-scale-2xl)] object-cover"
                />
                <div className="absolute -bottom-[32px] left-1/2 -translate-x-1/2">
                  <Select
                    variant="side"
                    options={SELF_OPTIONS}
                    defaultValue="data-scientist"
                    aria-label="Selected Self"
                  />
                </div>
              </div>
            ) : (
              <div className="flex size-full items-center justify-center rounded-[var(--gb-radius-scale-2xl)] border-[length:var(--gb-border-1)] border-dashed border-[var(--gb-border-bold)]">
                <div style={{ transform: `rotate(${-slot.rotate}deg)` }}>
                  <Button
                    variant="icon"
                    icon={<Icon id="plus-icon" />}
                    aria-label="Add a Self"
                    onClick={() => onAddSelf?.(slot.id)}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <p className="text-sm-medium absolute left-1/2 -translate-x-1/2 text-center text-[var(--gb-text-subtle)] top-[calc(50%-20px)]">
        self
        <br />
        you’ve created.
      </p>
    </div>
  );
}

function AssetDetailView({ onCreateAsset }: { onCreateAsset?: () => void }) {
  const [filter, setFilter] = React.useState<"brand-kit" | "content">(
    "brand-kit",
  );

  return (
    <div className="z-2 flex h-full w-[500px] shrink-0 flex-col items-start gap-[var(--gb-spacing-7)] overflow-clip bg-[var(--gb-background-subtlest)] px-[var(--gb-spacing-9)] pt-[var(--gb-spacing-10)] pb-[var(--gb-spacing-3)]">
      <div className="flex w-full items-center gap-[var(--gb-spacing-2)]">
        <Chips
          variant="secondary"
          selected={filter === "brand-kit"}
          onClick={() => setFilter("brand-kit")}
        >
          Brand Kit
        </Chips>
        <Chips
          variant="secondary"
          selected={filter === "content"}
          onClick={() => setFilter("content")}
        >
          Content
        </Chips>
      </div>

      <div className="flex w-full flex-wrap gap-[var(--gb-spacing-3-5)]">
        {ASSETS.map((asset) => (
          <div key={asset.id} className="flex w-[207px] flex-col">
            <p className="text-xs-regular w-full text-right text-[var(--gb-text-default)]">
              {asset.date}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.src}
              alt={asset.alt}
              className="h-[315px] w-full rounded-[var(--gb-radius-scale-2xl)] object-cover"
            />
          </div>
        ))}

        <div className="flex h-[315px] w-[207px] flex-col items-center justify-center gap-[var(--gb-spacing-2)] rounded-[var(--gb-radius-scale-2xl)] border-[length:var(--gb-border-1)] border-dashed border-[var(--gb-border-bolder)]">
          <Button
            variant="icon"
            icon={<Icon id="plus-icon" />}
            aria-label="Create more asset"
            onClick={onCreateAsset}
          />
          <p className="text-sm-medium text-center text-[var(--gb-text-default)]">
            Create more asset
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const [gnbExpanded, setGnbExpanded] = React.useState(false);

  return (
    <div className="dark relative flex h-screen w-screen items-start justify-end overflow-hidden bg-[var(--gb-background-default)]">
      <DottedBackground />

      <Gnb
        expanded={gnbExpanded}
        onExpandedChange={setGnbExpanded}
        items={GNB_ITEMS}
        activeId="assets"
        className="z-4"
      />

      <div className="relative z-3 flex min-w-0 flex-1 flex-col items-center justify-center gap-[var(--gb-spacing-6)] px-[var(--gb-spacing-6)] py-[var(--gb-spacing-5)]">
        <div className="absolute top-[9px] left-1/2 -translate-x-1/2">
          <ButtonGroup
            type="menu"
            activeId="assets"
            className="dark [&>button[data-selected]]:text-sm-semi-bold"
          />
        </div>

        <SelfCluster />
      </div>

      <AssetDetailView />

      <div className="absolute top-[20px] right-[36px] z-5">
        {/* TODO: 실제 Goal 데이터 연결 필요 — GoalSetting이 아직 어느 페이지에도
            연결되지 않아 공유 소스가 없음. GoalSetting.stories.tsx의 샘플 문구로 대체. */}
        <FloatingProfile
          avatarSrc="/images/personas/self-default.jpg"
          title="Data Scientist"
          portraitSrc="/images/personas/self-default.jpg"
          timestamp="2026.03.24 19:24:06"
          now="I'm known for financial modeling and data analysis in early-stage startups."
          goal="I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders."
          postingCount={3}
          postingFrequency="Day"
          targetedFollowersIndex={1}
          timeframe="1 year"
        />
      </div>
    </div>
  );
}
