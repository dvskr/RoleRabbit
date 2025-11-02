import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import StorageHeader from '../StorageHeader';
import 'jest-axe/extend-expect';

describe('StorageHeader accessibility', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <StorageHeader
        storageInfo={{ used: 1, limit: 10, percentage: 10, usedBytes: 1, limitBytes: 10 }}
        onUpload={jest.fn()}
        onRefresh={jest.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});


