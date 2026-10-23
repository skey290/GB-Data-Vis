import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GoalSetting, type GoalSettingAction } from "./goal-setting";

const NOW_ACTIONS: GoalSettingAction[] = [
  { id: "a1", category: "Content Studio", label: "Draft 3 posts" },
  { id: "a2", category: "Assets", label: "Add your case to Assets" },
  { id: "a3", category: "Content Studio", label: "Schedule this week's posts" },
  { id: "a4", category: "Content Studio", label: "Reply to comments" },
];

describe("GoalSetting", () => {
  it("renders the card title and calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<GoalSetting onClose={onClose} />);

    expect(screen.getByText("My goal")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows the placeholder guidance text when now/goal are empty", () => {
    render(<GoalSetting />);

    expect(
      screen.getByText(/What are you known for today/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/What do you want to be known for next/),
    ).toBeInTheDocument();
  });

  it("does not show the settings sentence when the goal is empty", () => {
    render(<GoalSetting />);

    expect(screen.queryByText("I post")).not.toBeInTheDocument();
  });

  it("shows the settings sentence once a goal value exists", () => {
    render(<GoalSetting defaultGoal="I'm known for a modeling partner." />);

    expect(screen.getByText("I post")).toBeInTheDocument();
    expect(screen.getByText("3 times a day")).toBeInTheDocument();
    expect(screen.getByText("5,000")).toBeInTheDocument();
    expect(screen.getByText("1 year")).toBeInTheDocument();
  });

  it("enters edit mode for Known for Now via the pencil button and saves the typed value", async () => {
    const user = userEvent.setup();
    const onNowChange = vi.fn();
    render(
      <GoalSetting defaultNow="Old now value" onNowChange={onNowChange} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Known for Now 편집" }),
    );
    const textarea = screen.getByRole("textbox", { name: "Known for Now" });
    await user.clear(textarea);
    await user.type(textarea, "New now value");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onNowChange).toHaveBeenCalledWith("New now value");
    expect(screen.getByText("New now value")).toBeInTheDocument();
  });

  it("discards the draft when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onNowChange = vi.fn();
    render(
      <GoalSetting defaultNow="Old now value" onNowChange={onNowChange} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Known for Now 편집" }),
    );
    const textarea = screen.getByRole("textbox", { name: "Known for Now" });
    await user.clear(textarea);
    await user.type(textarea, "Discarded value");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onNowChange).not.toHaveBeenCalled();
    expect(screen.getByText("Old now value")).toBeInTheDocument();
  });

  it("enters edit mode by clicking the statement box itself", async () => {
    const user = userEvent.setup();
    render(<GoalSetting defaultNow="Clickable value" />);

    await user.click(screen.getByText("Clickable value"));

    expect(
      screen.getByRole("textbox", { name: "Known for Now" }),
    ).toBeInTheDocument();
  });

  it("opens the Posting Frequency panel from the chip and commits the stepper value on Save", async () => {
    const user = userEvent.setup();
    const onPostingCountChange = vi.fn();
    render(
      <GoalSetting
        defaultGoal="Goal text"
        defaultPostingCount={3}
        onPostingCountChange={onPostingCountChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Known for Next 편집" }),
    );
    await user.click(screen.getByRole("button", { name: "3 times a day" }));
    expect(screen.getByText("Posting Frequency")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "증가" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onPostingCountChange).toHaveBeenCalledWith(4);
  });

  it("switches Posting Frequency selection inside the panel", async () => {
    const user = userEvent.setup();
    const onPostingFrequencyChange = vi.fn();
    render(
      <GoalSetting
        defaultGoal="Goal text"
        defaultPostingFrequency="Day"
        onPostingFrequencyChange={onPostingFrequencyChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Known for Next 편집" }),
    );
    await user.click(screen.getByRole("button", { name: "3 times a day" }));
    await user.click(screen.getByRole("radio", { name: "a Week" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onPostingFrequencyChange).toHaveBeenCalledWith("Week");
  });

  it("opens the Targeted Followers panel and commits the slider value on Save", async () => {
    const user = userEvent.setup();
    const onTargetedFollowersIndexChange = vi.fn();
    render(
      <GoalSetting
        defaultGoal="Goal text"
        defaultTargetedFollowersIndex={1}
        onTargetedFollowersIndexChange={onTargetedFollowersIndexChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Known for Next 편집" }),
    );
    await user.click(screen.getByRole("button", { name: "5,000" }));
    const slider = screen.getByRole("slider", { name: "Targeted Followers" });
    slider.focus();
    await user.keyboard("{ArrowRight}");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onTargetedFollowersIndexChange).toHaveBeenCalledWith(2);
  });

  it("opens the Timeframe panel and commits the selected option on Save", async () => {
    const user = userEvent.setup();
    const onTimeframeChange = vi.fn();
    render(
      <GoalSetting
        defaultGoal="Goal text"
        defaultTimeframe="1 year"
        onTimeframeChange={onTimeframeChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Known for Next 편집" }),
    );
    await user.click(screen.getByRole("button", { name: "1 year" }));
    await user.click(screen.getByRole("radio", { name: "3 months" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onTimeframeChange).toHaveBeenCalledWith("3 months");
  });

  it("highlights only the chip whose panel is currently open", async () => {
    const user = userEvent.setup();
    render(<GoalSetting defaultGoal="Goal text" />);

    await user.click(
      screen.getByRole("button", { name: "Known for Next 편집" }),
    );
    const frequencyChip = screen.getByRole("button", {
      name: "3 times a day",
    });
    const followersChip = screen.getByRole("button", { name: "5,000" });

    expect(frequencyChip).toHaveAttribute("aria-pressed", "false");
    await user.click(frequencyChip);
    expect(frequencyChip).toHaveAttribute("aria-pressed", "true");
    expect(followersChip).toHaveAttribute("aria-pressed", "false");

    await user.click(followersChip);
    expect(frequencyChip).toHaveAttribute("aria-pressed", "false");
    expect(followersChip).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles the same settings panel closed when its chip is clicked again", async () => {
    const user = userEvent.setup();
    render(<GoalSetting defaultGoal="Goal text" />);

    await user.click(
      screen.getByRole("button", { name: "Known for Next 편집" }),
    );
    await user.click(screen.getByRole("button", { name: "3 times a day" }));
    expect(screen.getByText("Posting Frequency")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "3 times a day" }));
    expect(screen.queryByText("Posting Frequency")).not.toBeInTheDocument();
  });

  it("hides the Gabrielle accordion when no actions are provided", () => {
    render(<GoalSetting defaultNow="value" nowActions={[]} />);

    expect(screen.queryByText(/Gabrielle suggests/)).not.toBeInTheDocument();
  });

  it("expands the Gabrielle accordion and shows up to 3 actions plus a +N more line", async () => {
    const user = userEvent.setup();
    render(<GoalSetting defaultNow="value" nowActions={NOW_ACTIONS} />);

    expect(
      screen.getByText("Gabrielle suggests 4 actions"),
    ).toBeInTheDocument();
    expect(screen.getByText("Needs approval")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Gabrielle suggests 4 actions/ }),
    );

    expect(screen.getByText("Draft 3 posts")).toBeInTheDocument();
    expect(screen.getByText("Add your case to Assets")).toBeInTheDocument();
    expect(screen.getByText("Schedule this week's posts")).toBeInTheDocument();
    expect(screen.queryByText("Reply to comments")).not.toBeInTheDocument();
    expect(screen.getByText("+ 1 more")).toBeInTheDocument();
  });

  it("calls the action's onRun when its Run button is clicked", async () => {
    const user = userEvent.setup();
    const onRun = vi.fn();
    const actions: GoalSettingAction[] = [
      { id: "a1", category: "Assets", label: "Do the thing", onRun },
    ];
    render(<GoalSetting defaultNow="value" nowActions={actions} />);

    await user.click(
      screen.getByRole("button", { name: /Gabrielle suggests 1 action/ }),
    );
    const row = screen.getByText("Do the thing").closest("div") as HTMLElement;
    await user.click(within(row).getByRole("button", { name: "Run" }));

    expect(onRun).toHaveBeenCalledTimes(1);
  });
});
