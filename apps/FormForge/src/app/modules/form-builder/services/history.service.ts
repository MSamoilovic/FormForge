import { Injectable, computed, signal } from '@angular/core';
import { FormField, FormTheme } from '@form-forge/models';

export interface FormState {
  fields: FormField[];
  theme?: FormTheme;
  selectedFieldId?: string | null;
}

@Injectable({
  providedIn: 'any',
})
export class HistoryService {
  private readonly MAX_HISTORY_SIZE = 50;

  private undoStack = signal<FormState[]>([]);
  private redoStack = signal<FormState[]>([]);

  public readonly canUndo = computed(() => this.undoStack().length > 0);
  public readonly canRedo = computed(() => this.redoStack().length > 0);

  public readonly undoCount = computed(() => this.undoStack().length);
  public readonly redoCount = computed(() => this.redoStack().length);

  public pushState(state: FormState): void {
    const currentStack = this.undoStack();

    if (currentStack.length > 0) {
      const lastState = currentStack[currentStack.length - 1];
      if (this.areStatesEqual(lastState, state)) {
        return;
      }
    }

    const clonedState = this.cloneState(state);
    const newStack = [...currentStack, clonedState];

    if (newStack.length > this.MAX_HISTORY_SIZE) {
      newStack.shift();
    }

    this.undoStack.set(newStack);
    this.redoStack.set([]);
  }

  public undo(currentState: FormState): FormState | null {
    const undoStackValue = this.undoStack();

    if (undoStackValue.length === 0) {
      return null;
    }

    const newUndoStack = [...undoStackValue];
    const previousState = newUndoStack.pop()!;

    const redoStackValue = this.redoStack();
    const newRedoStack = [...redoStackValue, this.cloneState(currentState)];

    this.undoStack.set(newUndoStack);
    this.redoStack.set(newRedoStack);

    return previousState;
  }

  public redo(currentState: FormState): FormState | null {
    const redoStackValue = this.redoStack();

    if (redoStackValue.length === 0) {
      return null;
    }

    const newRedoStack = [...redoStackValue];
    const nextState = newRedoStack.pop()!;

    const undoStackValue = this.undoStack();
    const newUndoStack = [...undoStackValue, this.cloneState(currentState)];

    this.undoStack.set(newUndoStack);
    this.redoStack.set(newRedoStack);

    return nextState;
  }

  public clear(): void {
    this.undoStack.set([]);
    this.redoStack.set([]);
  }

  private cloneState(state: FormState): FormState {
    return JSON.parse(JSON.stringify(state));
  }

  private areStatesEqual(state1: FormState, state2: FormState): boolean {
    return JSON.stringify(state1) === JSON.stringify(state2);
  }
}
