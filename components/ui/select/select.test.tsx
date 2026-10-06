import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Select } from "./select";

const SOCIAL_MEDIA_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
];

const COUNTRY_NUMBER_OPTIONS = [
  { value: "kr", label: "South Korea", code: "+82" },
  { value: "us", label: "United States", code: "+1" },
];

const FREQUENCY_OPTIONS = [
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
];

beforeAll(() => {
  // Radix Popover는 포지셔닝 계산에 ResizeObserver를 사용하는데 jsdom에는 없음
  if (!("ResizeObserver" in window)) {
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = vi
      .fn()
      .mockImplementation(function ResizeObserverMock() {
        return {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };
      });
  }
});

describe("Select", () => {
  it("renders the placeholder when no value is selected", () => {
    render(
      <Select
        type="social-media"
        options={SOCIAL_MEDIA_OPTIONS}
        placeholder="Select..."
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Select...");
  });

  it("renders the selected option's label", () => {
    render(
      <Select
        type="social-media"
        options={SOCIAL_MEDIA_OPTIONS}
        value="linkedin"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("LinkedIn");
  });

  it("renders the country code (not the label) for country-number type", () => {
    render(
      <Select
        type="country-number"
        options={COUNTRY_NUMBER_OPTIONS}
        value="kr"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("+82");
    expect(screen.getByRole("combobox")).not.toHaveTextContent("South Korea");
  });

  it("opens the listbox when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<Select type="social-media" options={SOCIAL_MEDIA_OPTIONS} />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });

  it("calls onValueChange and closes the list when an option is clicked", async () => {
    const user = userEvent.setup();
    let selected: string | undefined;

    render(
      <Select
        type="social-media"
        options={SOCIAL_MEDIA_OPTIONS}
        onValueChange={(value) => {
          selected = value;
        }}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    const option = await screen.findByText("Instagram");
    await user.click(option);

    expect(selected).toBe("instagram");
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("selects the highlighted option with ArrowDown + Enter", async () => {
    const user = userEvent.setup();
    let selected: string | undefined;

    render(
      <Select
        type="social-media"
        options={SOCIAL_MEDIA_OPTIONS}
        onValueChange={(value) => {
          selected = value;
        }}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(selected).toBe("linkedin");
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <Select type="social-media" options={SOCIAL_MEDIA_OPTIONS} disabled />,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("applies the error border token class when error is set", () => {
    render(<Select type="social-media" options={SOCIAL_MEDIA_OPTIONS} error />);

    expect(screen.getByRole("combobox").className).toContain(
      "border-[var(--border-error)]",
    );
  });

  describe("self style variants", () => {
    it("renders self/reverse with the persona label", () => {
      render(
        <Select
          type="self"
          style="reverse"
          options={[{ value: "a", label: "Data Scientist" }]}
          value="a"
        />,
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Data Scientist");
    });

    it("renders self/mute with the persona label", () => {
      render(
        <Select
          type="self"
          style="mute"
          options={[{ value: "a", label: "Data Scientist" }]}
          value="a"
        />,
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Data Scientist");
    });
  });

  describe("social-media icon style", () => {
    it("renders a trigger without any option label text", () => {
      render(
        <Select
          type="social-media"
          style="icon"
          options={SOCIAL_MEDIA_OPTIONS}
          value="instagram"
        />,
      );

      expect(screen.getByRole("combobox")).not.toHaveTextContent("Instagram");
    });

    it("still opens the dropdown and selects an option", async () => {
      const user = userEvent.setup();
      let selected: string | undefined;

      render(
        <Select
          type="social-media"
          style="icon"
          options={SOCIAL_MEDIA_OPTIONS}
          onValueChange={(value) => {
            selected = value;
          }}
        />,
      );

      await user.click(screen.getByRole("combobox"));
      const option = await screen.findByText("Instagram");
      await user.click(option);

      expect(selected).toBe("instagram");
    });
  });

  it("renders the frequency type options", async () => {
    const user = userEvent.setup();
    render(<Select type="frequency" options={FREQUENCY_OPTIONS} />);

    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText("Weeks")).toBeInTheDocument();
  });

  it("scrolls the listbox down when 'Show more options' is clicked (>6 options)", async () => {
    // jsdom에는 scrollBy 구현이 없어, 리스트 엘리먼트 인스턴스에 직접 mock을 꽂아
    // 호출 자체(올바른 인자로 호출되는지)를 검증한다.
    const user = userEvent.setup();
    const manyOptions = Array.from({ length: 10 }, (_, i) => ({
      value: `v${i}`,
      label: `Option ${i}`,
    }));
    render(<Select type="self" options={manyOptions} />);

    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    const scrollBySpy = vi.fn();
    listbox.scrollBy = scrollBySpy;

    const scrollNextButton = await screen.findByRole("button", {
      name: "Show more options",
    });
    await user.click(scrollNextButton);

    expect(scrollBySpy).toHaveBeenCalledWith({
      top: listbox.clientHeight,
      behavior: "smooth",
    });
  });
});
