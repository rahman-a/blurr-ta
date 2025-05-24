# Employee Feature

## Steps

### 1. Defines a Prisma schema

**Prompt:**

```md
Create a Prisma schema that defines the following models commonly found in a Human Resources system:

1. Department - Represents a company department.

   - Fields: id, name, description

2. Position - Represents a job title or role within a department.

   - Fields: id, title, description, departmentId

3. Compensation - Represents the benefits or payment structure for a position.

   - Fields: id, name, amount, description, isActive, type, isPercentage, salaryId
   - type could be deduction, allowance or bonus

4. Salary - Represents individual salary records.

   - Fields: id, basicSalary, grossSalary, netSalary, currency, salaryType, effectiveDate, endDate,
     isActive, employeeId
   - type could be hourly, monthly or yearly

5. Employee - Represents a staff member.
   - Fields: id, firstName, lastName, email, phone, positionId, departmentId, hireDate, isActive

Ensure all models include timestamps (createdAt, updatedAt), and appropriate foreign key constraints and use cascading safe strategy for relational integrity. Use appropriate Prisma syntax for defining relations.
```

### 2. Create Employee Form Based on Prisma Model

**Prompt:**

```md
Create a form for adding new employees using the Employee Prisma model. Include fields such as first name, last name, email, position, department, and hire date. Ensure proper form validation using react-hook-form with zod.
```

### 3. Use React Query to Fetch Departments and Positions

**Prompt:**

```md
Replace useEffect with react-query (`useQuery`) for fetching department and position data. Implement loading and error handling states, and cache responses..
```

### 4. Use Sonner for Toast Feedback Messages

**Prompt:**

```md
Integrate the Sonner toast notification library to provide real-time feedback messages for success or error during form submission. Ensure consistent UX across form interactions.
```

### 5. Add Salary Block to Employee Form

**Prompt:**

```md
Extend the employee creation form to include salary-related fields based on the Salary Prisma model. Allow the admin to input amount, currency, and start date.
```

### 6. Split Form into Logical Sections

**Prompt:**

```md
Divide the employee form into three sections:

- Personal Details
- Employment Details
- Salary Details

This improves user experience and maintainability.
```

### 7. Create Employee Form Based on Prisma Model

**Prompt:**

```md
Create a form for adding new employees using the Employee Prisma model. Include fields such as first name, last name, email, position, department, and hire date. Ensure proper form validation using react-hook-form with zod.
```

### 8. Break Form Sections into Separate Components

**Prompt:**

```md
Split each section of the employee form into its own component (e.g., `personal-info-section.tsx`, `employment-details-section.tsx`, `salary-details-section.tsx`) to keep the main form component clean and modular.
```

### 9. Use useQueries for Parallel Queries

**Prompt:**

```md
Use useQueries from react-query to fetch department and position data in parallel rather than using two separate useQuery calls.
```

### 10. Create Salary Management Dashboard

**Prompt:**

```md
Develop a Salary Management page that includes both summary and detailed insights. Structure the page into two main sections:

1. Statistical Overview Card

   - Display four statistic cards at the top of the page:
     - Total Employees
     - Average Basic Salary
     - Average Gross Salary
     - Average Net Salary
   - Each card should dynamically fetch and display data using `react-query`.
   - Ensure the cards are responsive and styled consistently with the rest of the UI.

2. Salary Table with Month Filter
   - Display a table that lists employees and their corresponding salary details.
   - Include fields such as employee name, position, department, basic salary, compensation, gross salary, and net salary.
   - Implement a filtering mechanism that allows the user to select a specific month to filter the table data.
   - Use URL query parameters (e.g., with nuqs) to persist the selected month.
   - Ensure pagination is supported if the dataset is large.

The entire page should be modular, using reusable components and styled using your design system (e.g., Shadcn).
```

### 11. Add Pagination to Employee and Salary Tables

**Prompt:**

```md
Implement pagination controls (page number, page size) for both the employee and salary tables. Ensure backend API supports pagination parameters.
```

### 12. Composite Filtration for Employee Table

**Prompt:**

```md
Enhance the employee table by adding a composite filter consisting of:

1. Dropdown to select the target column
2. Dropdown to select the filter operation
3. Input to provide the search term (rendered dynamically based on column type)
```
