import { AccountRegisterForm } from '@/components/account/account-auth-forms';
import { AccountAuthShell } from '@/components/account/account-auth-shell';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Регистрация кабинета',
  description: 'Создание личного кабинета MARI.',
  path: '/account/register'
});

export default function AccountRegisterPage() {
  return (
    <AccountAuthShell
      breadcrumbs={[
        { label: 'Главная', href: '/' },
        { label: 'Личный кабинет', href: '/account' },
        { label: 'Регистрация' }
      ]}
      title="Создать кабинет."
      description="Один раз создайте кабинет, чтобы дальше не повторять контакты при каждой записи и видеть историю визитов в одном месте."
      heroKicker="Личный кабинет"
      heroTitle="Кабинет за минуту."
      heroDescription="Создайте кабинет один раз, чтобы сохранить контакты, видеть записи и быстрее оформлять следующие визиты."
      heroNote="После регистрации вы сразу попадёте в кабинет и сможете продолжить запись без повторного входа."
    >
      <AccountRegisterForm />
    </AccountAuthShell>
  );
}
