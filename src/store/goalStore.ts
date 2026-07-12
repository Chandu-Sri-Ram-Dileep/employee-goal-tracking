import { create } from "zustand";

export interface Goal {
  id: string;
  title: string;
  status: string;
}

interface GoalState {
  goals: Goal[];

  addGoal: (goal: Goal) => void;

  submitGoal: (id: string) => void;
}

export const useGoalStore =
  create<GoalState>((set) => ({
    goals: [],

    addGoal: (goal) =>
      set((state) => ({
        goals: [...state.goals, goal],
      })),

    submitGoal: (id) =>
      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === id
            ? {
                ...goal,
                status: "SUBMITTED",
              }
            : goal
        ),
      })),
  }));