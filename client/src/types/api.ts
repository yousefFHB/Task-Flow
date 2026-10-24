/**
 * TypeScript Contracts derived directly from backend schemas and API responses.
 * Backend: Express + Prisma (PostgreSQL) + Redis
 */

// ─── User & Auth Types ───────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string | null;
  phoneNumber: string; // Formatted or masked depending on endpoint
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

export interface LoginRequestBody {
  phoneNumber: string; // Matches ^09\d{9}$
  password: string;    // Min 6 chars
}

export interface RegisterRequestBody {
  phoneNumber: string; // Matches ^09\d{9}$
  password: string;    // Min 6 chars
  name?: string;       // Optional
  code: string;        // 4-6 digits OTP code
}

export interface ResendCodeRequestBody {
  phoneNumber: string; // Matches ^09\d{9}$
}

export interface ForgetPasswordRequestBody {
  phoneNumber: string; // Matches ^09\d{9}$
  code: string;        // 4-6 digits OTP code
  newPassword: string; // Min 6 chars
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface AuthSuccessResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}

export interface SimpleSuccessResponse {
  success: boolean;
  message: string;
}

// ─── User Management Types ───────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SearchUsersParams {
  q: string;           // Required by searchUserValidator
  page?: number;       // Defaults to 1
  limit?: number;      // Defaults to 10
}

export interface SearchUsersResponse {
  success: boolean;
  data: User[];
  pagination: PaginationMeta;
}

export interface GetUserByIdResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface UpdateProfileRequestBody {
  name: string;        // 2 to 50 chars
}

export interface UpdateProfileResponse {
  success: boolean;
  data: User;
  message: string;
}

// ─── Company Types (Schema & Controller Contract) ────────────────────────────

export type CompanyMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Company {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyMember {
  id: number;
  userId: number;
  companyId: number;
  role: CompanyMemberRole;
  joinedAt: string;
  company?: Company;
  user?: Pick<User, 'id' | 'name' | 'phoneNumber'>;
}

export interface GetAllCompanyParams {
  page?: number;
  limit?: number;
  q?: string;
  sort?: 'joinedAt' | 'name' | 'createdAt' | 'role' | '-joinedAt' | '-name' | '-createdAt' | '-role';
}

export interface GetAllCompanyResponse {
  success: boolean;
  message: string;
  data: CompanyMember[];
  pagination: PaginationMeta;
}

// ─── Error Formats ───────────────────────────────────────────────────────────

export interface ValidationErrorField {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success?: boolean;
  message: string;
  errors?: ValidationErrorField[];
}
