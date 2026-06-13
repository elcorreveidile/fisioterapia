import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scheduledEmails } from '@/db/schema';
import { and, eq, lte } from 'drizzle-orm';
import { sendScheduledEmail } from '@/lib/email';

// Protegido con un secreto compartido (cabecera Authorization).
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // Emails pendientes cuya fecha programada ya ha llegado.
    const due = await db
      .select({ id: scheduledEmails.id })
      .from(scheduledEmails)
      .where(and(eq(scheduledEmails.sent, false), lte(scheduledEmails.scheduledFor, now)));

    let processed = 0;
    let errors = 0;

    for (const email of due) {
      const result = await sendScheduledEmail(email.id);
      if (result.ok) processed++;
      else errors++;
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      message: `Procesados ${processed} emails, ${errors} con error`,
    });
  } catch (error) {
    console.error('Error processing emails:', error);
    return NextResponse.json({ error: 'Error processing emails' }, { status: 500 });
  }
}
