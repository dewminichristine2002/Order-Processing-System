import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders shipping dashboard heading", () => {
  render(<App />);
  const heading = screen.getByText(/shipping service dashboard/i);
  expect(heading).toBeInTheDocument();
});
