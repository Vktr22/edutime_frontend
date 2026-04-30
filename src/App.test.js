import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app and shows not-logged-in message', () => {
  render(<App />);
  const el = screen.getByText(/Not logged in/i);
  expect(el).toBeInTheDocument();
});
