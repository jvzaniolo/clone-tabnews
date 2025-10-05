import styles from './index.module.css';
import confetti from 'canvas-confetti';

export default function Home() {
  function handleClick() {
    confetti();
  }

  return (
    <div className={styles.homePage}>
      <h1>Rafaella, você é meu momoh ❤️</h1>
      <button onClick={handleClick}>Clique aqui</button>
    </div>
  );
}
