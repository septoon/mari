import { AccountPanel } from '@/components/account-panel';
import { Container } from '@/components/ui/container';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Личный кабинет',
  description: 'Личный кабинет MARI: профиль, история визитов, отмена записи и восстановление доступа.',
  path: '/account'
});

export default function AccountPage() {
  return (
    <main className="pb-14">
      <Container>
        <AccountPanel />
      </Container>
    </main>
  );
}
