# Software Specification: TaskForge Analytics Engine Component

## 1. Objective
Build an isolated, interactive Frontend Analytics Dashboard component within TaskForge to display real-time productivity statistics and historical completion rates without changing the backend API.

## 2. Functional Requirements
*   **Metric Cards Panel:** Display three real-time computed data blocks at the top of the interface:
    *   *Total Productivity Score*: An integer calculated using the formula:
        $$S = (\text{Completed Tasks} \times 10) + (\text{Total Subtasks} \times 5)$$
    *   *Completion Ratio*: Percentage of tasks closed out of total tasks.
    *   *Estimated Velocity*: A predictive metric showing the number of tasks completed per minute based on the session history.
*   **Visual Chart Render:** Build a responsive, visual bar chart or line chart showing task completion history using HTML Canvas elements directly inside React.
*   **Data Integrity:** The component must read the active `tasks` array state directly and dynamically re-calculate metrics on-the-fly whenever a task is added or deleted.

## 3. UI Component Structure Layout
*   Container background: `#f8fafc`
*   Layout structure: Flexbox or Grid, responsive width matching main container.
*   Interactions: Toggling a button labeled "📊 View System Analytics" slips open this drawer interface view directly below the task list wrapper card.