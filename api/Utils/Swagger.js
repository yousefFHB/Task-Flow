// Comprehensive OpenAPI 3.0.3 Specification for TaskFlow (Jira SaaS) API
export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Jira Enterprise API",
    version: "1.0.0",
    description:
      "Enterprise REST API documentation for TaskFlow workspace management, authentication, user directory, multi-tenant companies, projects, teams, and Kanban task tracking.",
    contact: {
      name: "Jira Engineering",
      url: "https://github.com/yousefFHB/jira",
    },
    license: {
      name: "ISC",
    },
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local Development Server (Default: 8000)",
    },
    {
      url: "http://localhost:5000",
      description: "Docker Compose Backend (Port 5000)",
    },
  ],
  tags: [
    { name: "Authentication", description: "JWT session, registration, phone verification, and password recovery" },
    { name: "Users", description: "User directory search, profile administration, and identity lookups" },
    { name: "Company", description: "Multi-tenant company workspaces, member roles, and organizational access" },
    { name: "Projects", description: "Project creation, status tracking, and member role assignment" },
    { name: "Teams", description: "Departmental team structures, lead assignments, and member grouping" },
    { name: "Tasks", description: "Kanban task lifecycles, priority levels, assignment, and status boards" },
    { name: "System", description: "Application health checks and Redis cache connectivity" },
  ],
  paths: {
    // ─── SYSTEM ───────────────────────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["System"],
        summary: "Check operational health",
        description: "Returns application status and Redis cache connection state.",
        responses: {
          200: {
            description: "System is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    redis: { type: "string", example: "ready" },
                    message: { type: "string", example: "Healthy !!?" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ─── AUTHENTICATION ───────────────────────────────────────────────────────
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register new user account",
        description: "Creates a new user record and issues SMS verification code.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["phoneNumber", "password"],
                properties: {
                  phoneNumber: { type: "string", example: "09123456789" },
                  password: { type: "string", format: "password", example: "password123" },
                  name: { type: "string", example: "Jane Doe" },
                  inviteCode: { type: "string", example: "WORKSPACE-INVITE" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "User registered successfully" },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Validation error or phone already registered" },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Authenticate user and receive JWT",
        description: "Validates user phone number and password, returning an authorization token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["phoneNumber", "password"],
                properties: {
                  phoneNumber: { type: "string", example: "09123456789" },
                  password: { type: "string", format: "password", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "login successfully" },
                    data: {
                      type: "object",
                      properties: {
                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." },
                        user: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Invalid phone number or password" },
        },
      },
    },

    "/api/auth/resend-code": {
      post: {
        tags: ["Authentication"],
        summary: "Resend verification SMS OTP",
        description: "Regenerates and dispatches a new SMS verification code to the registered phone number.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["phoneNumber"],
                properties: {
                  phoneNumber: { type: "string", example: "09123456789" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Code resent successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Verification code sent" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/forget-pass": {
      post: {
        tags: ["Authentication"],
        summary: "Initiate password reset via OTP",
        description: "Sends an OTP code to the user's phone for password recovery.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["phoneNumber"],
                properties: {
                  phoneNumber: { type: "string", example: "09123456789" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Recovery OTP sent",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Reset code dispatched" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ─── USERS ────────────────────────────────────────────────────────────────
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Search users across directory",
        description: "Search registered users with pagination by name or phone query.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            description: "Search keyword (name or phone number)",
            schema: { type: "string", example: "0912" },
          },
          {
            name: "page",
            in: "query",
            description: "Page number (1-based)",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Items per page",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          200: {
            description: "List of matching users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer", example: 1 },
                        pages: { type: "integer", example: 1 },
                        total: { type: "integer", example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      patch: {
        tags: ["Users"],
        summary: "Update current user profile",
        security: [{ bearerAuth: [] }],
        description: "Updates profile information (such as display name) for the authenticated user.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Jane Smith" },
                  avatar: { type: "string", example: "https://example.com/avatar.png" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Profile updated successfully" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized - missing or invalid token" },
        },
      },

      delete: {
        tags: ["Users"],
        summary: "Delete authenticated user account",
        security: [{ bearerAuth: [] }],
        description: "Permanently removes the authenticated user account and associated credentials.",
        responses: {
          200: {
            description: "Account deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "User account deleted successfully" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user details by ID",
        description: "Retrieves public profile information for a specific user ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Numeric user identifier",
            schema: { type: "integer", example: 1 },
          },
        ],
        responses: {
          200: {
            description: "User details record",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          404: { description: "User not found" },
        },
      },
    },

    // ─── COMPANY ──────────────────────────────────────────────────────────────
    "/api/company": {
      get: {
        tags: ["Company"],
        summary: "List companies",
        description: "Returns paginated list of companies registered in the workspace system.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          200: {
            description: "Companies list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Company" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Company"],
        summary: "Create new company workspace",
        security: [{ bearerAuth: [] }],
        description: "Creates an organization workspace with the creator assigned as OWNER.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Acme Corporation" },
                  slug: { type: "string", example: "acme-corp" },
                  logo: { type: "string", example: "https://example.com/logo.png" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Company created successfully" },
          400: { description: "Validation error or slug already taken" },
        },
      },
    },

    "/api/company/{id}": {
      get: {
        tags: ["Company"],
        summary: "Get company by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } },
        ],
        responses: {
          200: { description: "Company details" },
          404: { description: "Company not found" },
        },
      },
      patch: {
        tags: ["Company"],
        summary: "Update company details",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Acme Global" },
                  logo: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Company updated" },
        },
      },
      delete: {
        tags: ["Company"],
        summary: "Delete company",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } },
        ],
        responses: {
          200: { description: "Company deleted" },
        },
      },
    },

    "/api/company/{id}/member": {
      post: {
        tags: ["Company"],
        summary: "Add or remove company member",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["phoneNumber"],
                properties: {
                  phoneNumber: { type: "string", example: "09123456789" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Membership modified" },
        },
      },
    },

    "/api/company/{id}/member/role": {
      put: {
        tags: ["Company"],
        summary: "Update company member role",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "role"],
                properties: {
                  userId: { type: "integer", example: 2 },
                  role: { type: "string", enum: ["OWNER", "ADMIN", "MEMBER"], example: "ADMIN" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Role updated" },
        },
      },
    },

    "/api/company/{id}/leave": {
      post: {
        tags: ["Company"],
        summary: "Leave company workspace",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } },
        ],
        responses: {
          200: { description: "Successfully left company" },
        },
      },
    },

    // ─── PROJECTS ─────────────────────────────────────────────────────────────
    "/api/projects": {
      get: {
        tags: ["Projects"],
        summary: "List company projects",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "companyId", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Projects list" },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create new project",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "companyId"],
                properties: {
                  name: { type: "string", example: "Frontend Redesign" },
                  description: { type: "string", example: "Next generation UI" },
                  companyId: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Project created" },
        },
      },
    },

    // ─── TEAMS ────────────────────────────────────────────────────────────────
    "/api/teams": {
      get: {
        tags: ["Teams"],
        summary: "List teams in company",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "companyId", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Teams list" },
        },
      },
      post: {
        tags: ["Teams"],
        summary: "Create new team",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "companyId"],
                properties: {
                  name: { type: "string", example: "Engineering Team" },
                  companyId: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Team created" },
        },
      },
    },

    // ─── TASKS ────────────────────────────────────────────────────────────────
    "/api/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks with Kanban filters",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "projectId", in: "query", schema: { type: "integer" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCEL"] } },
          { name: "priority", in: "query", schema: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] } },
        ],
        responses: {
          200: { description: "Tasks list" },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create new Kanban task",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "projectId"],
                properties: {
                  title: { type: "string", example: "Implement User Authentication" },
                  description: { type: "string", example: "Add JWT token handling and cookies" },
                  status: { type: "string", enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCEL"], default: "TODO" },
                  priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
                  projectId: { type: "integer", example: 1 },
                  assignedId: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Task created" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your Bearer JWT token in the format: Bearer <token>",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Jane Doe" },
          phoneNumber: { type: "string", example: "09123456789" },
          avatar: { type: "string", nullable: true, example: null },
          createdAt: { type: "string", format: "date-time", example: "2026-10-18T12:00:00Z" },
          updatedAt: { type: "string", format: "date-time", example: "2026-10-18T12:00:00Z" },
        },
      },
      Company: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Acme Corp" },
          slug: { type: "string", example: "acme-corp" },
          logo: { type: "string", nullable: true, example: null },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};

export default swaggerSpec;
