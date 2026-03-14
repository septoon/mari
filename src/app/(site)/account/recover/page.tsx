import { AccountRecoverForm } from '@/components/account/account-auth-forms';
import { AccountAuthShell } from '@/components/account/account-auth-shell';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Восстановление доступа',
  description: 'Запрос на восстановление доступа в личный кабинет MARI.',
  path: '/account/recover'
});

export default function AccountRecoverPage() {
  return (
    <AccountAuthShell
      breadcrumbs={[
        { label: 'Главная', href: '/' },
        { label: 'Личный кабинет', href: '/account' },
        { label: 'Восстановление доступа' }
      ]}
      title="Восстановление доступа."
      description="Укажите email или телефон. Если данные найдены, мы отправим ссылку для смены пароля."
      heroKicker="Личный кабинет"
      heroTitle="Вернуть доступ без звонка в салон."
      heroDescription="Если забыли пароль, достаточно оставить телефон или email. Ссылку для смены пароля отправим автоматически."
      heroNote="После перехода по ссылке из письма вы сможете задать новый пароль и снова войти в кабинет."
    >
      <AccountRecoverForm />
    </AccountAuthShell>
  );
}
