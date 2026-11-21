import { NewPasswordForm } from '@/components/auth-form';
import { Logo } from '@/components/ui';
import { session } from '@/lib/supabase';

// Reached from the reset email: the link has already signed the user in.
export default async function ResetPassword() {
  const { user } = await session();
  return (
    <main className="pa" style={{ display: 'block' }}>
      <div className="scroll" style={{ alignItems: 'center', paddingTop: 64 }}>
        <div className="narrow" style={{ maxWidth: 420 }}>
          <Logo size={32} />
          <div>
            <h1 className="title">Set a new password</h1>
            <span className="sub">For {user.email}. You’ll stay signed in on this device.</span>
          </div>
          <NewPasswordForm />
        </div>
      </div>
    </main>
  );
}
