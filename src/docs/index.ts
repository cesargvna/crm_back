import { permissionSectionPaths } from './paths/permissionSection';
import { moduleGroupPaths } from './paths/moduleGroup';
import { submoduleGroupPaths } from './paths/submoduleGroup';

export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'CRM API Documentation',
    version: '1.0.0',
    description:
      'This documentation provides all available API endpoints for the CRM system. The platform supports multi-tenant architecture where each tenant represents a unique client or company. Each tenant operates independently with its own roles, users, permissions, subsidiaries, and configurations. The System Admin is the only user who can manage tenants globally. Within a tenant, a Super Admin user can manage internal configurations such as roles and users. The documentation includes endpoints for managing tenants, subsidiaries, permissions, roles, and more.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Permission Section', description: 'Permission structure grouping modules and submodules' },
    { name: 'Permission Module', description: 'Modules grouped under a permission section' },
    { name: 'Permission Submodule', description: 'Submodules grouped under a permission module' },
  ],
  paths: {
    ...permissionSectionPaths,
    ...moduleGroupPaths,
    ...submoduleGroupPaths,
  },
};
