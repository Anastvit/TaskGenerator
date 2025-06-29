import styles from './GenerateButton.module.css';

const GenerateButton = ({ onClick }) => (
  <button className={styles.button} onClick={onClick}>
    Сгенерировать
  </button>
);

export default GenerateButton;
