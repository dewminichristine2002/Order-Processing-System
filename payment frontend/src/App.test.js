import { render, screen } from '@testing-library/react';
import App from './App';

test('renders payment service heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Payment Service/i);
  expect(headingElement).toBeInTheDocument();
});
