import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders shipping operations heading", () => {
  render(<App />);
  const heading = screen.getByText(/frontend aligned to your shipping backend/i);
  expect(heading).toBeInTheDocument();
});
