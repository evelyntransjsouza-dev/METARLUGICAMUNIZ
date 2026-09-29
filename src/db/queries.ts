import { db } from './index.ts';
import { users, vacationRequests } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { INITIAL_USERS, INITIAL_REQUESTS } from '../data/mockData.ts';
import { getSupabaseClient } from './supabase.ts';

// Helper: Convert App User to Supabase format (snake_case)
function toSupabaseUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email || null,
    phone: u.phone,
    password: u.password,
    role: u.role || 'employee',
    department: u.department,
    job_title: u.jobTitle,
    admission_date: u.admissionDate,
    total_vacation_days: u.totalVacationDays ?? 30,
    used_vacation_days: u.usedVacationDays ?? 0,
    badge_number: u.badgeNumber || null,
  };
}

// Helper: Convert Supabase User to App format (camelCase)
function fromSupabaseUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    password: u.password,
    role: u.role,
    department: u.department,
    jobTitle: u.job_title || u.jobTitle,
    admissionDate: u.admission_date || u.admissionDate,
    totalVacationDays: u.total_vacation_days ?? u.totalVacationDays ?? 30,
    usedVacationDays: u.used_vacation_days ?? u.usedVacationDays ?? 0,
    badgeNumber: u.badge_number || u.badgeNumber,
  };
}

// Helper: Convert App Request to Supabase format (snake_case)
function toSupabaseRequest(r: any) {
  return {
    id: r.id,
    employee_id: r.employeeId,
    employee_name: r.employeeName,
    employee_phone: r.employeePhone,
    department: r.department,
    job_title: r.jobTitle,
    start_date: r.startDate,
    end_date: r.endDate,
    requested_days: r.requestedDays,
    agreed_days: r.agreedDays ?? null,
    agreed_start_date: r.agreedStartDate || null,
    agreed_end_date: r.agreedEndDate || null,
    status: r.status,
    sell_vacation_allowance: r.sellVacationAllowance ?? false,
    is_installment: r.isInstallment ?? false,
    installment_period: r.installmentPeriod || null,
    employee_notes: r.employeeNotes || null,
    owner_notes: r.ownerNotes || null,
    reviewed_at: r.reviewedAt || null,
  };
}

// Helper: Convert Supabase Request to App format (camelCase)
function fromSupabaseRequest(r: any) {
  return {
    id: r.id,
    employeeId: r.employee_id || r.employeeId,
    employeeName: r.employee_name || r.employeeName,
    employeePhone: r.employee_phone || r.employeePhone,
    department: r.department,
    jobTitle: r.job_title || r.jobTitle,
    startDate: r.start_date || r.startDate,
    endDate: r.end_date || r.endDate,
    requestedDays: r.requested_days ?? r.requestedDays,
    agreedDays: r.agreed_days !== undefined ? r.agreed_days : (r.agreedDays ?? null),
    agreedStartDate: r.agreed_start_date || r.agreedStartDate,
    agreedEndDate: r.agreed_end_date || r.agreedEndDate,
    status: r.status,
    sellVacationAllowance: r.sell_vacation_allowance ?? r.sellVacationAllowance ?? false,
    isInstallment: r.is_installment ?? r.isInstallment ?? false,
    installmentPeriod: r.installment_period || r.installmentPeriod,
    employeeNotes: r.employee_notes || r.employeeNotes,
    ownerNotes: r.owner_notes || r.ownerNotes,
    reviewedAt: r.reviewed_at || r.reviewedAt,
    createdAt: r.created_at || r.createdAt,
  };
}

// ==========================================
// USERS QUERIES
// ==========================================

export async function getDbUsers() {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(fromSupabaseUser);
      }
    } catch (err) {
      console.warn('Supabase users query warning, falling back to local database:', err);
    }
  }

  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Database query failed for users:', error);
    throw new Error('Falha ao buscar usuários no banco de dados.', { cause: error });
  }
}

export async function insertDbUser(newUser: any) {
  const supabase = getSupabaseClient();
  
  // 1. Send to Supabase directly if configured
  if (supabase) {
    try {
      const supabasePayload = toSupabaseUser(newUser);
      const { data, error } = await supabase.from('users').upsert(supabasePayload).select().single();
      if (error) {
        console.error('Supabase user insert error:', error);
      } else if (data) {
        console.log('User synced to Supabase successfully:', data.id);
      }
    } catch (err) {
      console.error('Failed to sync user to Supabase:', err);
    }
  }

  // 2. Also keep local database updated
  try {
    const result = await db.insert(users).values({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email || null,
      phone: newUser.phone,
      password: newUser.password,
      role: newUser.role,
      department: newUser.department,
      jobTitle: newUser.jobTitle,
      admissionDate: newUser.admissionDate,
      totalVacationDays: newUser.totalVacationDays ?? 30,
      usedVacationDays: newUser.usedVacationDays ?? 0,
      badgeNumber: newUser.badgeNumber || null,
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        name: newUser.name,
        email: newUser.email || null,
        phone: newUser.phone,
        password: newUser.password,
        role: newUser.role,
        department: newUser.department,
        jobTitle: newUser.jobTitle,
        admissionDate: newUser.admissionDate,
        totalVacationDays: newUser.totalVacationDays ?? 30,
        usedVacationDays: newUser.usedVacationDays ?? 0,
        badgeNumber: newUser.badgeNumber || null,
      }
    }).returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed for inserting user:', error);
    return newUser;
  }
}

// ==========================================
// VACATION REQUESTS QUERIES
// ==========================================

export async function getDbRequests() {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      const { data, error } = await supabase.from('vacation_requests').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(fromSupabaseRequest);
      }
    } catch (err) {
      console.warn('Supabase requests query warning, falling back to local database:', err);
    }
  }

  try {
    return await db.select().from(vacationRequests).orderBy(desc(vacationRequests.createdAt));
  } catch (error) {
    console.error('Database query failed for requests:', error);
    throw new Error('Falha ao buscar solicitações de férias no banco de dados.', { cause: error });
  }
}

export async function insertDbRequest(newReq: any) {
  const supabase = getSupabaseClient();
  
  // 1. Send to Supabase directly if configured
  if (supabase) {
    try {
      const supabasePayload = toSupabaseRequest(newReq);
      const { data, error } = await supabase.from('vacation_requests').insert(supabasePayload).select().single();
      if (error) {
        console.error('Supabase request insert error:', error);
      } else if (data) {
        console.log('Vacation request sent to Supabase successfully:', data.id);
      }
    } catch (err) {
      console.error('Failed to send request to Supabase:', err);
    }
  }

  // 2. Also keep local database updated
  try {
    const result = await db.insert(vacationRequests).values({
      id: newReq.id,
      employeeId: newReq.employeeId,
      employeeName: newReq.employeeName,
      employeePhone: newReq.employeePhone,
      department: newReq.department,
      jobTitle: newReq.jobTitle,
      startDate: newReq.startDate,
      endDate: newReq.endDate,
      requestedDays: newReq.requestedDays,
      agreedDays: newReq.agreedDays ?? null,
      agreedStartDate: newReq.agreedStartDate || null,
      agreedEndDate: newReq.agreedEndDate || null,
      status: newReq.status || 'pending',
      sellVacationAllowance: newReq.sellVacationAllowance ?? false,
      isInstallment: newReq.isInstallment ?? false,
      installmentPeriod: newReq.installmentPeriod || null,
      employeeNotes: newReq.employeeNotes || null,
      ownerNotes: newReq.ownerNotes || null,
      reviewedAt: newReq.reviewedAt || null,
    }).returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed for inserting request:', error);
    return newReq;
  }
}

export async function updateDbRequest(id: string, updates: any) {
  const supabase = getSupabaseClient();
  
  // 1. Update in Supabase
  if (supabase) {
    try {
      const supabaseUpdates: any = {};
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.agreedDays !== undefined) supabaseUpdates.agreed_days = updates.agreedDays;
      if (updates.agreedStartDate !== undefined) supabaseUpdates.agreed_start_date = updates.agreedStartDate;
      if (updates.agreedEndDate !== undefined) supabaseUpdates.agreed_end_date = updates.agreedEndDate;
      if (updates.ownerNotes !== undefined) supabaseUpdates.owner_notes = updates.ownerNotes;
      if (updates.reviewedAt !== undefined) supabaseUpdates.reviewed_at = updates.reviewedAt;

      const { data, error } = await supabase
        .from('vacation_requests')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase request update error:', error);
      } else {
        console.log('Vacation request updated in Supabase successfully:', id);
      }
    } catch (err) {
      console.error('Failed to update request in Supabase:', err);
    }
  }

  // 2. Update local database
  try {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.agreedDays !== undefined) updateData.agreedDays = updates.agreedDays;
    if (updates.agreedStartDate !== undefined) updateData.agreedStartDate = updates.agreedStartDate;
    if (updates.agreedEndDate !== undefined) updateData.agreedEndDate = updates.agreedEndDate;
    if (updates.ownerNotes !== undefined) updateData.ownerNotes = updates.ownerNotes;
    if (updates.reviewedAt !== undefined) updateData.reviewedAt = updates.reviewedAt;

    const result = await db.update(vacationRequests)
      .set(updateData)
      .where(eq(vacationRequests.id, id))
      .returning();
    return result[0] || { id, ...updates };
  } catch (error) {
    console.error('Database query failed for updating request:', error);
    return { id, ...updates };
  }
}

export async function deleteDbRequest(id: string) {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      const { error } = await supabase.from('vacation_requests').delete().eq('id', id);
      if (error) console.error('Supabase request delete error:', error);
      else console.log('Vacation request deleted from Supabase:', id);
    } catch (err) {
      console.error('Failed to delete request from Supabase:', err);
    }
  }

  try {
    await db.delete(vacationRequests).where(eq(vacationRequests.id, id));
    return { success: true };
  } catch (error) {
    console.error('Database query failed for deleting request:', error);
    return { success: true };
  }
}

// ==========================================
// BULK SYNC ALL DATA TO SUPABASE
// ==========================================

export async function syncAllDataToSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase não está configurado. Conecte primeiro com URL e Chave API.');
  }

  // 1. Get all current users (from DB or INITIAL_USERS fallback)
  let currentUsers = [];
  try {
    currentUsers = await db.select().from(users);
  } catch (e) {
    currentUsers = INITIAL_USERS;
  }
  if (!currentUsers || currentUsers.length === 0) {
    currentUsers = INITIAL_USERS;
  }

  // 2. Get all requests
  let currentRequests = [];
  try {
    currentRequests = await db.select().from(vacationRequests);
  } catch (e) {
    currentRequests = INITIAL_REQUESTS;
  }
  if (!currentRequests || currentRequests.length === 0) {
    currentRequests = INITIAL_REQUESTS;
  }

  // 3. Upsert Users into Supabase
  const supabaseUsers = currentUsers.map(toSupabaseUser);
  const { error: userError } = await supabase.from('users').upsert(supabaseUsers, { onConflict: 'id' });
  if (userError) {
    throw new Error(`Erro ao sincronizar colaboradores no Supabase: ${userError.message}`);
  }

  // 4. Upsert Requests into Supabase
  const supabaseRequests = currentRequests.map(toSupabaseRequest);
  const { error: reqError } = await supabase.from('vacation_requests').upsert(supabaseRequests, { onConflict: 'id' });
  if (reqError) {
    throw new Error(`Erro ao sincronizar solicitações no Supabase: ${reqError.message}`);
  }

  return {
    success: true,
    usersSynced: supabaseUsers.length,
    requestsSynced: supabaseRequests.length,
    message: `Sucesso! ${supabaseUsers.length} colaboradores e ${supabaseRequests.length} solicitações foram enviadas para o Supabase!`
  };
}

export async function seedInitialDataIfEmpty() {
  try {
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log('Seeding initial users and vacation requests into Cloud SQL...');
      for (const u of INITIAL_USERS) {
        await db.insert(users).values({
          id: u.id,
          name: u.name,
          email: u.email || null,
          phone: u.phone,
          password: u.password,
          role: u.role,
          department: u.department,
          jobTitle: u.jobTitle,
          admissionDate: u.admissionDate,
          totalVacationDays: u.totalVacationDays,
          usedVacationDays: u.usedVacationDays,
          badgeNumber: u.badgeNumber || null,
        }).onConflictDoNothing();
      }

      for (const r of INITIAL_REQUESTS) {
        await db.insert(vacationRequests).values({
          id: r.id,
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          employeePhone: r.employeePhone,
          department: r.department,
          jobTitle: r.jobTitle,
          startDate: r.startDate,
          endDate: r.endDate,
          requestedDays: r.requestedDays,
          agreedDays: r.agreedDays,
          agreedStartDate: r.agreedStartDate || null,
          agreedEndDate: r.agreedEndDate || null,
          status: r.status,
          sellVacationAllowance: r.sellVacationAllowance,
          isInstallment: r.isInstallment,
          installmentPeriod: r.installmentPeriod || null,
          employeeNotes: r.employeeNotes || null,
          ownerNotes: r.ownerNotes || null,
          reviewedAt: r.reviewedAt || null,
        }).onConflictDoNothing();
      }
      console.log('Seed completed successfully.');
    }
  } catch (error) {
    console.error('Error during database seed check:', error);
  }
}
