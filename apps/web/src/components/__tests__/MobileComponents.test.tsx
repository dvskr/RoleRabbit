import React from 'react';
import { render, screen } from '@testing-library/react';
import { TouchGesture, MobileSidebar, MobileModal, MobileTabSwiper, MobileDrawer, MobileButton } from '../MobileComponents';

describe('MobileComponents', () => {
  it('renders mobile button', () => {
    render(<MobileButton>Test Button</MobileButton>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders mobile sidebar', () => {
    render(<MobileSidebar isOpen={true} onClose={() => {}}>Sidebar Content</MobileSidebar>);
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
  });

  it('renders mobile modal', () => {
    render(<MobileModal isOpen={true} onClose={() => {}}>Modal Content</MobileModal>);
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('renders mobile tab swiper', () => {
    render(<MobileTabSwiper tabs={['Tab 1', 'Tab 2']} activeTab={0} onTabChange={() => {}}>Tab Content</MobileTabSwiper>);
    expect(screen.getByText('Tab Content')).toBeInTheDocument();
  });

  it('renders mobile drawer', () => {
    render(<MobileDrawer isOpen={true} onClose={() => {}}>Drawer Content</MobileDrawer>);
    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('renders touch gesture', () => {
    render(<TouchGesture onPan={() => {}}>Gesture Content</TouchGesture>);
    expect(screen.getByText('Gesture Content')).toBeInTheDocument();
  });

  it('handles mobile button click', () => {
    const handleClick = jest.fn();
    render(<MobileButton onClick={handleClick}>Click Me</MobileButton>);
    screen.getByText('Click Me').click();
    expect(handleClick).toHaveBeenCalled();
  });

  it('handles mobile sidebar close', () => {
    const handleClose = jest.fn();
    render(<MobileSidebar isOpen={true} onClose={handleClose}>Sidebar</MobileSidebar>);
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('handles mobile modal close', () => {
    const handleClose = jest.fn();
    render(<MobileModal isOpen={true} onClose={handleClose}>Modal</MobileModal>);
    expect(screen.getByText('Modal')).toBeInTheDocument();
  });

  it('handles mobile drawer close', () => {
    const handleClose = jest.fn();
    render(<MobileDrawer isOpen={true} onClose={handleClose}>Drawer</MobileDrawer>);
    expect(screen.getByText('Drawer')).toBeInTheDocument();
  });
});