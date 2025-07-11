import { sectionPaths } from "./paths/section";
import { modulePaths } from "./paths/module";
import { submodulePaths } from "./paths/submodule";
import { permissionActionPaths } from "./paths/permissionAction";
import { allowedActionPaths } from "./paths/allowedAction";
import { tenantPaths } from "./paths/tenant";
import { subsidiaryPaths } from "./paths/subsidiary";
import { rolePaths } from "./paths/role";
import { rolePermissionPaths } from "./paths/rolePermission";
import { scheduleSubsidiaryPaths } from "./paths/scheduleSubsidiary";
import { userPaths } from "./paths/user";
import { scheduleUserPaths } from "./paths/scheduleUser";
import { expenseCategoryPaths } from "./paths/expenseCategory";
import { expensePaths } from "./paths/expense";
import { incomeCategoryPaths } from "./paths/incomeCategory";
import { incomePaths } from "./paths/income";
import { clientPaths } from "./paths/client";
import { clientCategoryPaths } from "./paths/clientCategory";
import { supplierCategoryPaths } from "./paths/supplierCategory";
import { supplierPaths } from "./paths/supplier";

export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "CRM API Documentation",
    version: "1.0.0",
    description:
      "This documentation provides all available API endpoints for the CRM system. The platform supports multi-tenant architecture where each tenant represents a unique client or company. Each tenant operates independently with its own roles, users, permissions, subsidiaries, and configurations. The System Admin is the only user who can manage tenants globally. Within a tenant, a Super Admin user can manage internal configurations such as roles and users. The documentation includes endpoints for managing tenants, subsidiaries, permissions, roles, and more.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Section",
      description: "Permission structure grouping modules and submodules",
    },
    {
      name: "Module",
      description: "Modules grouped under a permission section",
    },
    {
      name: "Submodule",
      description: "Submodules grouped under a permission module",
    },
    {
      name: "Permission Action",
      description: "Atomic permission operations like view, edit, create, etc.",
    },
    {
      name: "Allowed Action",
      description: "",
    },
    {
      name: "Role",
      description:
        "Roles assigned to subsidiaries, with permission configurations",
    },
    {
      name: "Role Permission",
      description: "Assign and retrieve permissions linked to roles",
    },
    {
      name: "Tenant",
      description:
        "Represents a client or organization that owns its own users, roles, and subsidiaries",
    },
    {
      name: "Subsidiary",
      description:
        "Creates a new subsidiary under a specific tenant. The `subsidiary_type` must be one of: MATRIZ, SUCURSAL, ALMACEN, OFICINA.",
    },
    {
      name: "ScheduleSubsidiary",
      description: `Manages working schedules for subsidiary based on day and hour range.
        - Fields \`start_day\` and \`end_day\` must be valid days of the week in Spanish:
        \`LUNES\`, \`MARTES\`, \`MIERCOLES\`, \`JUEVES\`, \`VIERNES\`, \`SABADO\`, \`DOMINGO\`.
        - Fields \`opening_hour\` and \`closing_hour\` must follow the \`HH:mm\` 24-hour format (e.g., \`08:00\`, \`16:30\`).
        - The start day must not come after the end day.
        - The opening hour must be earlier than the closing hour.`,
    },
    {
      name: "User",
      description:
        "Manage users: creation, update, password, and status toggling. Each user belongs to a subsidiary and has a role with permissions.",
    },
    {
      name: "ScheduleUser",
      description: `Manages working schedules for users based on day and hour range.
        - Fields \`start_day\` and \`end_day\` must be valid days of the week in Spanish:
        \`LUNES\`, \`MARTES\`, \`MIERCOLES\`, \`JUEVES\`, \`VIERNES\`, \`SABADO\`, \`DOMINGO\`.
        - Fields \`opening_hour\` and \`closing_hour\` must follow the \`HH:mm\` 24-hour format (e.g., \`08:00\`, \`16:30\`).
        - The start day must not come after the end day.
        - The opening hour must be earlier than the closing hour.`,
    },
    {
      name: "Expense Category",
      description: `Manages expense categories for subsidiaries.
        - Each expense category belongs to a specific Subsidiary and Tenant.
        - Names are normalized (lowercase, no accents, "ñ" replaced with "n").
        - Supports creation, update, status toggle, and list/filter by Subsidiary.`,
    },
    {
      name: "Expense",
      description: `Manages individual expenses for subsidiaries.
        - Each expense must belong to a valid Expense Category, User, Subsidiary, and Tenant.
        - Supports creation with automatic normalization of name and calculation of total amount.
        - Supports update of fields like quantity, unit price, or category.
        - Supports filtering and paginated retrieval by Subsidiary.
        - Includes relations to Expense Category and User for context.`,
    },
    {
      name: "Income Category",
      description: `Manages income categories for subsidiaries.
        - Each income category belongs to a specific Subsidiary and Tenant.
        - Names are normalized (lowercase, no accents, "ñ" replaced with "n").
        - Supports creation, update, status toggle, and list/filter by Subsidiary.`,
    },
    {
      name: "Income",
      description: `Manages individual incomes for subsidiaries.
        - Each income must belong to a valid Income Category, User, Subsidiary, and Tenant.
        - Supports creation with automatic normalization of name and calculation of total amount.
        - Supports update of fields like quantity, unit price, or category.
        - Supports filtering and paginated retrieval by Subsidiary.
        - Includes relations to Income Category and User for context.`,
    },
    {
      name: "ClientCategory",
      description: `Manages client categories for subsidiaries.
        - Each category belongs to a Subsidiary and Tenant.
        - Names are normalized: lowercase, no accents, "ñ" replaced with "n".
        - Supports create, update, toggle status (which cascades to clients), and list/filter by Subsidiary.`,
    },
    {
      name: "Client",
      description: `Manages individual clients.
        - Each client belongs to a ClientCategory, Subsidiary, and Tenant.
        - Names are normalized: no accents, "ñ" replaced with "n".
        - Email is trimmed and lowercased.
        - Supports create, update, status toggle, and list/filter by Subsidiary.
        - Includes automatic validation for unique names within a tenant and subsidiary.`,
    },
    {
      name: "SupplierCategory",
      description: `Manages supplier categories for subsidiaries.
        - Each category belongs to a Subsidiary and Tenant.
        - Names are normalized: lowercase, no accents, "ñ" replaced with "n".
        - Supports create, update, toggle status (which cascades to related suppliers), and list/filter by Subsidiary.
        - Includes endpoints to list only active categories or all categories without pagination.`,
    },
    {
      name: "Supplier",
      description: `Manages individual suppliers.
        - Each supplier belongs to a SupplierCategory, Subsidiary, and Tenant.
        - Names are normalized: no accents, "ñ" replaced with "n".
        - Email is trimmed and lowercased.
        - Supports create, update, status toggle, and list/filter by Subsidiary.
        - Supports search by name, company, or phone.
        - Includes automatic validation for unique names within a tenant and subsidiary.`,
    },
  ],
  paths: {
    ...sectionPaths,
    ...modulePaths,
    ...submodulePaths,
    ...permissionActionPaths,
    ...allowedActionPaths,
    ...rolePaths,
    ...rolePermissionPaths,
    ...tenantPaths,
    ...subsidiaryPaths,
    ...scheduleSubsidiaryPaths,
    ...userPaths,
    ...scheduleUserPaths,
    ...expenseCategoryPaths,
    ...expensePaths,
    ...incomeCategoryPaths,
    ...incomePaths,
    ...clientCategoryPaths,
    ...clientPaths,
    ...supplierCategoryPaths,  
    ...supplierPaths,      
  },
};
