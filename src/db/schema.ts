import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone').notNull(),
  password: text('password').notNull(),
  role: text('role').notNull(), // 'owner' | 'employee'
  department: text('department').notNull(),
  jobTitle: text('job_title').notNull(),
  admissionDate: text('admission_date').notNull(),
  totalVacationDays: integer('total_vacation_days').default(30).notNull(),
  usedVacationDays: integer('used_vacation_days').default(0).notNull(),
  badgeNumber: text('badge_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vacationRequests = pgTable('vacation_requests', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').references(() => users.id).notNull(),
  employeeName: text('employee_name').notNull(),
  employeePhone: text('employee_phone').notNull(),
  department: text('department').notNull(),
  jobTitle: text('job_title').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  requestedDays: integer('requested_days').notNull(),
  agreedDays: integer('agreed_days'),
  agreedStartDate: text('agreed_start_date'),
  agreedEndDate: text('agreed_end_date'),
  status: text('status').notNull(), // 'pending' | 'approved' | 'approved_adjusted' | 'rejected' | 'cancelled'
  sellVacationAllowance: boolean('sell_vacation_allowance').default(false).notNull(),
  isInstallment: boolean('is_installment').default(false).notNull(),
  installmentPeriod: text('installment_period'),
  employeeNotes: text('employee_notes'),
  ownerNotes: text('owner_notes'),
  reviewedAt: text('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  vacationRequests: many(vacationRequests),
}));

export const vacationRequestsRelations = relations(vacationRequests, ({ one }) => ({
  employee: one(users, {
    fields: [vacationRequests.employeeId],
    references: [users.id],
  }),
}));
