'use client';

import React from 'react';
import AIPanelRedesigned from './AIPanel/AIPanelRedesigned';
import { AIPanelProps } from './AIPanel/types/AIPanel.types';

export default function AIPanel(props: AIPanelProps) {
  return <AIPanelRedesigned {...props} />;
}
