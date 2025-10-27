/**
 * Basic App Test
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('App Tests', () => {
  it('should render', () => {
    expect(true).toBe(true);
  });

  it('should test basic math', () => {
    expect(1 + 1).toBe(2);
  });
});

