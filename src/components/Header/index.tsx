import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <Link href="/">
        <a className={styles.content}>
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
