import { permissionSectionPaths } from "./paths/permissionSection";
import { moduleGroupPaths } from "./paths/moduleGroup";
import { submoduleGroupPaths } from "./paths/submoduleGroup";
import { permissionActionPaths } from "./paths/permissionAction";
import { tenantPaths } from "./paths/tenant";
import { subsidiaryPaths } from "./paths/subsidiary";
import { rolePaths } from "./paths/role";
import { rolePermissionPaths } from "./paths/rolePermission";
import { scheduleSubsidiaryPaths } from "./paths/scheduleSubsidiary";
import { userPaths } from "./paths/user";
import { scheduleUserPaths } from "./paths/scheduleUser";

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
      name: "Permission Section",
      description: "Permission structure grouping modules and submodules",
    },
    {
      name: "Permission Module",
      description: "Modules grouped under a permission section",
    },
    {
      name: "Permission Submodule",
      description: "Submodules grouped under a permission module",
    },
    {
      name: "Permission Action",
      description: "Atomic permission operations like view, edit, create, etc.",
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
      description:
        `Manages working schedules for subsidiary based on day and hour range.
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
      description: 
        `Manages working schedules for users based on day and hour range.
        - Fields \`start_day\` and \`end_day\` must be valid days of the week in Spanish:
        \`LUNES\`, \`MARTES\`, \`MIERCOLES\`, \`JUEVES\`, \`VIERNES\`, \`SABADO\`, \`DOMINGO\`.
        - Fields \`opening_hour\` and \`closing_hour\` must follow the \`HH:mm\` 24-hour format (e.g., \`08:00\`, \`16:30\`).
        - The start day must not come after the end day.
        - The opening hour must be earlier than the closing hour.`,
    },
  ],
  paths: {
    ...permissionSectionPaths,
    ...moduleGroupPaths,
    ...submoduleGroupPaths,
    ...permissionActionPaths,
    ...rolePaths,
    ...rolePermissionPaths,
    ...tenantPaths,
    ...subsidiaryPaths,
    ...scheduleSubsidiaryPaths,
    ...userPaths,
    ...scheduleUserPaths,
  },
};
