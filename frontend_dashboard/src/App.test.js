import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard navigation", () => {
  render(<App />);
  expect(screen.getByText(/IOT SEC MONITOR/i)).toBeInTheDocument();
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Devices/i)).toBeInTheDocument();
  expect(screen.getByText(/Event Logs/i)).toBeInTheDocument();
});
