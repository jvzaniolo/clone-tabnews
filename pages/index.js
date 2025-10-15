import Link from 'next/link';
import styles from './index.module.css';
import confetti from 'canvas-confetti';

export default function Home() {
  function handleClick() {
    confetti();
  }

  return (
    <div className={styles.homePage}>
      <h1 className="text-2xl p-8">Rafaella, você é meu momoh ❤️</h1>
      <Link href="/carrossel" onClick={handleClick}>
        Clique aqui
      </Link>
    </div>
  );
}
