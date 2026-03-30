import ParticleCanvas from '@/components/auth/ParticleCanvas';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      <ParticleCanvas />
      <div className="auth-content">{children}</div>
    </div>
  );
}
