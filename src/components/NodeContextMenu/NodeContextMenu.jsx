import React from 'react';
import styles from './NodeContextMenu.module.css';

const NodeContextMenu = ({ x, y, nodeId, onAction }) => {
  if (!nodeId) return null;

  const handleClick = (type) => {
    onAction(type, nodeId);
  };

  return (
    <div className={styles.menu} style={{ top: y, left: x }}>
      <div className={styles.item} onClick={() => handleClick('makeRoot')}>
        Сделать корнем
      </div>
      <div className={styles.item} onClick={() => handleClick('duplicate')}>
        Дублировать
      </div>
      <div className={styles.item} onClick={() => handleClick('delete')}>
        Удалить
      </div>
    </div>
  );
};

export default NodeContextMenu;
