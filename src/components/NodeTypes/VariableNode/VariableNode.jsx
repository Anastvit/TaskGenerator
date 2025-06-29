import React, { useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import styles from './VariableNode.module.css';

const MIN_W = 180;
const MAX_W = 400;
const PAD_X = 32;

const VariableNode = ({ data, id, selected }) => {
  const { custom = {}, onUpdate, onContext } = data;
  const {
    useRange = false,
    value = '',
    range = {},
    varType = 'number',
    options = ''
  } = custom;

  const nodeRef = useRef(null);

  const update = (patch) => {
    if (typeof onUpdate === 'function') {
      onUpdate(id, { ...custom, ...patch });
    }
  };

  const measure = (text, font) => {
    const cvs = measure.c || (measure.c = document.createElement('canvas'));
    const ctx = cvs.getContext('2d');
    ctx.font = font;
    return ctx.measureText(text).width;
  };

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    if (custom.useRange) {
      node.style.width = `400px`;
      return;
    }

    const font = window.getComputedStyle(node).font;
    const values = [
      custom.value?.toString() || '',
      custom.options || '',
      custom.varType || ''
    ];

    const widest = values.reduce((m, t) => Math.max(m, measure(t, font)), 0);
    const total = Math.min(Math.max(widest + PAD_X, MIN_W), MAX_W);
    node.style.width = `${total}px`;
  }, [custom]);

  return (
    <div
      ref={nodeRef}
      className={`${styles.node} ${data.isRoot ? styles.root : ''} ${selected ? styles.selected : ''}`}
      onContextMenu={(e) => onContext?.(e, id)}
    >
      <Handle type="target" position={Position.Left} className={styles.handle} />

      <div className={styles.group}>
        <label>Тип переменной:</label>
        <select
          value={varType}
          onChange={(e) => update({ varType: e.target.value })}
        >
          <option value="number">Число</option>
          <option value="string">Строка</option>
        </select>
      </div>

      {varType === 'number' && (
        <>
          <div className={styles.group}>
            <label>
              <input
                type="checkbox"
                checked={useRange}
                onChange={(e) => update({ useRange: e.target.checked })}
              />
              Указать диапазон
            </label>
          </div>

          {!useRange && (
            <div className={styles.group}>
              <label>Значение:</label>
              <input
                type="number"
                value={value}
                onChange={(e) => update({ value: e.target.value })}
              />
            </div>
          )}

          {useRange && (
            <div className={styles.group}>
              <label>Диапазон:</label>
              <div className={styles.inline}>
                <input
                  type="number"
                  placeholder="min"
                  value={range.min || ''}
                  onChange={(e) => update({ range: { ...range, min: e.target.value } })}
                />
                <input
                  type="number"
                  placeholder="max"
                  value={range.max || ''}
                  onChange={(e) => update({ range: { ...range, max: e.target.value } })}
                />
              </div>
            </div>
          )}
        </>
      )}

      {varType === 'string' && (
        <div className={styles.group}>
          <label>Варианты (через запятую):</label>
          <input
            type="text"
            placeholder="первый, второй, третий"
            value={options}
            onChange={(e) => update({ options: e.target.value })}
          />
        </div>
      )}

      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  );
};

export default VariableNode;
