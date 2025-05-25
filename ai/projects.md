# Project Management Feature

## Steps

### 1. Laying out the project system

**Prompts:**

```md
create the project management system and ensure the following is met

- User can Add, manage projects
- User can add tasks to the projects
- Tasks will have needed fields: Title, Description, priority, assigned to, status
- User can assign employee to the task
- Kanban board to display the tasks by their status
- Backlog table to display all the tasks
```

### 2. Implement RHF and zod for validation

**Prompts**

```md
make sure that all forms use RHF and zod for validation

- when create project, form can't submit until project name and at least start date is entered
- when creating task, also make sure the task name is entered before submitting
```

### 3. Show the employees list in assignedTo Dropdown

**Prompts**

```md
Render the Employee list in the AssignTo dropdown list so the use can choose the certain employee
```

### 4. Use server action instead of api route

**Prompts**

```md
instead of create dedicated api route for fetching projects and tasks
create a server action instead and integrate in the project
and when submitting form, use react query to submit form data to server action function to create task or project
```

### 5. Separate the action component of project and task card

**Prompts**

```md
create a separate component for action of both project and task card
and also redesign it to use two separate icons buttons with label next to them
```

### 6. Show confirmation modal before deletion

**Prompts**

```md
when user click on delete of the project or task show him confirmation modal first
```
