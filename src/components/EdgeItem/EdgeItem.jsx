import React from 'react';
import { getBezierPath } from 'reactflow';
import styles from './EdgeItem.module.css';

const EdgeItem = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const handleContextMenu = (e) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent('edge-context', {
        detail: {
          id,
          x: e.clientX,
          y: e.clientY,
        },
      })
    );
  };

  const isMulti = data?.type === 'multi';
  const strokeDasharray = isMulti ? '6,4' : 'none';
  const strokeColor = isMulti ? '#007bff' : '#333';

  return (
    <g>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={strokeColor}
        strokeWidth={2}
        fill="none"
        markerEnd={markerEnd}
        strokeDasharray={strokeDasharray}
      />
      <path
        d={edgePath}
        className={styles.interactionPath}
        onContextMenu={handleContextMenu}
      />
    </g>
  );
};

export default EdgeItem;
