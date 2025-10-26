declare module 'react-beautiful-dnd' {
  export interface DropResult {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    destination?: {
      droppableId: string;
      index: number;
    } | null;
    reason: 'DROP' | 'CANCEL';
    combine?: any;
    mode: 'FLUID' | 'SNAP' | null;
  }
  
  export interface DraggableProvided {
    draggableProps: any;
    dragHandleProps: any;
    innerRef: (element?: HTMLElement | null) => void;
  }
  
  export interface DroppableProvided {
    innerRef: (element?: HTMLElement | null) => void;
    droppableProps: any;
    placeholder?: React.ReactElement | null;
  }
  
  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDraggingOver: boolean;
    isDropAnimating: boolean;
    isClone: boolean;
    draggingOver?: string;
    combineWith?: string;
    combineTargetFor?: string;
    mode?: 'FLUID' | 'SNAP';
  }
  
  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith?: string;
    draggingFromThisWith?: string;
  }

  export const DragDropContext: any;
  export const Droppable: any;
  export const Draggable: any;
}
