import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders Text Remixer heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Text Remixer/i);
  expect(headingElement).toBeInTheDocument();
});
