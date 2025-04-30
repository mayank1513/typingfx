import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, test } from "vitest";
import { TypeOut } from "./type-out";

describe.concurrent("type-out", () => {
	afterEach(cleanup);

	test("Dummy test - test if renders without errors", ({ expect }) => {
		const clx = "my-class";
		render(<TypeOut className={clx} />);
		expect(screen.getByTestId("type-out").classList).toContain(clx);
	});
});
