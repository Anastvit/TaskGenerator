import React from 'react';
import { Handle, Position } from 'reactflow';
import styles from './ArrayNode.module.css';

const ArrayNode = ({ data, id }) => {
  const { custom = {}, onUpdate, onContext } = data;
  const {
    length = '',
    mode = 'range',
    values = [],
    range = {}
  } = { mode: 'range', ...custom };

  const update = (patch) => {
    if (typeof onUpdate === 'function') {
      onUpdate(id, { ...custom, ...patch });
    }
  };

  const handleValueChange = (index, val) => {
    const updated = [...(values || [])];
    updated[index] = val;
    update({ values: updated });
  };

  return (
    <div
      className={`${styles.node} ${data.isRoot ? styles.root : ''}`}
      onContextMenu={(e) => onContext?.(e, id)}
    >
      <Handle type="target" position={Position.Left} className={styles.handle} />

      <div className={styles.group}>
        <label>Длина массива:</label>
        <input
          type="number"
          value={length}
          onChange={(e) => update({ length: e.target.value })}
        />
      </div>

      <div className={styles.group}>
        <label>Режим:</label>
        <div className={styles.inline}>
          <label>
            <input
              type="radio"
              name={`mode-${id}`}
              checked={mode === 'manual'}
              onChange={() => update({ mode: 'manual' })}
            />
            Ручной
          </label>
          <label>
            <input
              type="radio"
              name={`mode-${id}`}
              checked={mode === 'range'}
              onChange={() => update({ mode: 'range' })}
            />
            Диапазон
          </label>
        </div>
      </div>

      {mode === 'manual' && (
        <div className={styles.group}>
          <label>Значения:</label>
          <div className={styles.verticalList}>
            {Array.from({ length: Number(length) || 0 }).map((_, i) => (
              <input
                key={i}
                type="text"
                placeholder={`элемент ${i + 1}`}
                value={values[i] || ''}
                onChange={(e) => handleValueChange(i, e.target.value)}
              />
            ))}
          </div>
        </div>
      )}

      {mode === 'range' && (
        <div className={styles.group}>
          <label>Диапазон значений:</label>
          <div className={styles.inline}>
            <input
              type="number"
              placeholder="min"
              value={range.min || ''}
              onChange={(e) =>
                update({ range: { ...range, min: e.target.value } })
              }
            />
            <input
              type="number"
              placeholder="max"
              value={range.max || ''}
              onChange={(e) =>
                update({ range: { ...range, max: e.target.value } })
              }
            />
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  );
};

export default ArrayNode;
