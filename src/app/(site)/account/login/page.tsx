import { AccountLoginForm } from '@/components/account/account-auth-forms';
import { AccountAuthShell } from '@/components/account/account-auth-shell';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Вход в кабинет',
  description: 'Вход в личный кабинет MARI.',
  path: '/account/login'
});

export default function AccountLoginPage() {
  return (
    <AccountAuthShell
      breadcrumbs={[
        { label: 'Главная', href: '/' },
        { label: 'Личный кабинет', href: '/account' },
        { label: 'Вход' }
      ]}
      title="Вход в кабинет."
      description="Введите номер телефона и пароль, чтобы открыть историю визитов, сохранить профиль и управлять будущими записями."
      heroKicker="Личный кабинет"
      heroTitle="Войдите и управляйте своими визитами."
      heroDescription="После входа вы увидите будущие записи, историю визитов, данные профиля и персональные предложения."
      heroNote="Если вы впервые в MARI, создайте кабинет за пару минут и сохраните все визиты в одном месте."
    >
      <AccountLoginForm />
    </AccountAuthShell>
  );
}
