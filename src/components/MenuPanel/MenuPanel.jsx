import React from 'react';
import styles from './MenuPanel.module.css';

const nodeTypes = [
  { label: 'Текст', value: 'element' },
  { label: 'Переменная', value: 'variable' },
  { label: 'Массив', value: 'array' },
];

const MenuPanel = () => {
  const handleDragStart = (e, type) => {
    const data = {
      type,
      data: {
        label: type === 'element' ? '' : type,
        custom: {},
      },
    };
    e.dataTransfer.setData('application/reactflow', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Добавить узел</h3>
      <div className={styles.typeList}>
        {nodeTypes.map((t) => (
          <div
            key={t.value}
            className={styles.typeButton}
            draggable
            onDragStart={(e) => handleDragStart(e, t.value)}
          >
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPanel;
