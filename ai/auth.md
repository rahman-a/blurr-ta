# Auth Feature

## Steps

### 1. Refactor the authentication page.

**Prompt:**

```md
Ensure that each form component is moved to its own file within a suitable `components` directory. After separation:

- Import the `LoginForm` component into the login page.
- Import the `RegisterForm` component into the registration page.
- Remove the `"use client"` directive from the top of both pages if it exists, and only include it in the new component files if necessary.
  Ensure the components are functionally equivalent after refactoring.
```

### 2. Implement form validation

**Prompt:**

```md
implement form validation using `react-hook-form` in combination with `zod` for schema-based validation.
Install the necessary dependencies if they are not already installed:
```

### 3. Integrating Shadcn Form Component with RHF Controllers

**Prompt:**

```md
Integrate Shadcn’s `Form` component to enhance styling and consistency with the design system. Ensure it works seamlessly with `react-hook-form` by:

Steps:

- Wrapping the form fields with the Shadcn `Form` component and its subcomponents (like `FormField`, `FormItem`, etc.).
- Using the `Controller` component from `react-hook-form` to properly bind each input with the form state.
- Apply this integration in both `LoginForm` and `RegisterForm` components.

Ensure the UI maintains a clean and user-friendly layout aligned with the Shadcn component library.
```
