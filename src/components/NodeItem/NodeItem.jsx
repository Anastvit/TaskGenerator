import { useState, useEffect, useRef } from 'react';
import { Handle, Position, useUpdateNodeInternals, useReactFlow } from 'reactflow';
import styles from './NodeItem.module.css';

const MIN_W = 150;
const MAX_W = 300;
const PAD_X = 24;

const NodeItem = ({ id, data, isRoot }) => {
  const [text, setText] = useState(data.label || '');
  const textareaRef = useRef(null);
  const nodeRef = useRef(null);
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const measureLine = (line, font) => {
    const cvs = measureLine.c || (measureLine.c = document.createElement('canvas'));
    const ctx = cvs.getContext('2d');
    ctx.font = font;
    return ctx.measureText(line).width;
  };

  useEffect(() => {
    setNodes(nodes =>
      nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, label: text } } : n
      )
    );
    updateNodeInternals(id);
  }, [text, id, setNodes, updateNodeInternals]);

  useEffect(() => {
    const ta = textareaRef.current;
    const node = nodeRef.current;
    if (!ta || !node) return;

    const font = window.getComputedStyle(ta).font;
    const longest = text.split('\n').reduce((m, l) => Math.max(m, measureLine(l || ' ', font)), 0);
    const nodeW = Math.min(Math.max(longest + PAD_X, MIN_W), MAX_W);

    node.style.width = `${nodeW}px`;
    ta.style.width = '100%';

    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [text]);

  return (
    <div
      ref={nodeRef}
      className={`${styles.node} ${isRoot ? styles.root : ''}`}
      onContextMenu={e => data?.onContext?.(e, id)}
    >
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Введите текст..."
        rows={1}
      />
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  );
};

export default NodeItem;
