import React from 'react';
import styles from './ContextMenu.module.css';

const ContextMenu = ({ x, y, id }) => {
  const dispatchTypeChange = (type) => {
    window.dispatchEvent(
      new CustomEvent('edge-type-change', {
        detail: { id, type },
      })
    );
  };

  const handleDelete = () => {
    window.dispatchEvent(
      new CustomEvent('edge-delete', {
        detail: { id },
      })
    );
  };

  return (
    <div className={styles.menu} style={{ top: y, left: x }}>
      <button className={styles.item} onClick={() => dispatchTypeChange('single')}>
        Одиночная связь
      </button>
      <button className={styles.item} onClick={() => dispatchTypeChange('multi')}>
        Множественная связь
      </button>
      <button className={styles.item} onClick={handleDelete}>
        Удалить связь
      </button>
    </div>
  );
};

export default ContextMenu;
