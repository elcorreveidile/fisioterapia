import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { verificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import RequestForm from './RequestForm';

export default async function MiCuentaPage() {
  // Si ya hay una sesión válida (cookie del enlace usado), vamos directos al área.
  const token = (await cookies()).get('patient_access')?.value;
  if (token) {
    const [vt] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token));
    if (vt && vt.expires > new Date()) {
      redirect(`/mi-cuenta/${token}`);
    }
  }

  return <RequestForm />;
}
