import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlowProvider,
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import NodeItem from '@components/NodeItem';
import EdgeItem from '@components/EdgeItem';
import VariableNode from '@components/NodeTypes/VariableNode';
import ArrayNode from '@components/NodeTypes/ArrayNode';
import ContextMenu from '@components/ContextMenu';
import NodeContextMenu from '@components/NodeContextMenu';
import Sidebar from '@components/Sidebar';
import VariantGenerator from '@components/VariantGenerator';

import styles from './Canvas.module.css';

const CanvasContent = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [paths, setPaths] = useState([]);
  const [rootNodeId, setRootNodeId] = useState(null);
  const [templateKey, setTemplateKey] = useState(null);
  const [edgeContextMenu, setEdgeContextMenu] = useState({ visible: false, x: 0, y: 0, edgeId: null });
  const [nodeContextMenu, setNodeContextMenu] = useState({ x: 0, y: 0, nodeId: null });

  const variantRef = useRef();
  const { project, fitView } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      element: props => <NodeItem {...props} isRoot={props.id === rootNodeId} />,
      variable: VariableNode,
      array: ArrayNode
    }),
    [rootNodeId]
  );

  const edgeTypes = useMemo(() => ({ default: EdgeItem }), []);

  const onNodesChange = useCallback(changes => {
    setNodes(nds => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback(changes => {
    setEdges(eds => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(connection => {
    setEdges(eds =>
      addEdge(
        {
          ...connection,
          source: String(connection.source),
          target: String(connection.target),
          data: { type: 'single' }
        },
        eds
      )
    );
  }, []);

  const onDrop = useCallback(
    event => {
      event.preventDefault();
      const bounds = event.currentTarget.getBoundingClientRect();
      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;
      const data = JSON.parse(raw);
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      });
      const newNode = {
        id: String(Date.now()),
        type: data.type,
        position,
        data: {
          ...data.data,
          onUpdate: (id, newCustom) => {
            setNodes(nds =>
              nds.map(n => (n.id === id ? { ...n, data: { ...n.data, custom: newCustom } } : n))
            );
          },
          onContext: (e, id) => {
            e.preventDefault();
            setNodeContextMenu({ x: e.clientX, y: e.clientY, nodeId: id });
          },
          isRoot: false
        }
      };
      setNodes(nds => nds.concat(newNode));
    },
    [project]
  );

  const onDragOver = event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleNodeAction = (action, nodeId) => {
    setNodeContextMenu({ x: 0, y: 0, nodeId: null });

    if (action === 'delete') {
      setNodes(nds => nds.filter(n => n.id !== nodeId));
      setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
      return;
    }

    if (action === 'makeRoot') {
      setNodes(nds =>
        nds.map(n => ({
          ...n,
          data: {
            ...n.data,
            isRoot: n.id === nodeId
          }
        }))
      );
      setRootNodeId(nodeId);
      return;
    }

    if (action === 'duplicate') {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        const newNode = {
          ...node,
          id: String(Date.now()),
          position: { x: node.position.x + 40, y: node.position.y + 40 },
          data: {
            ...node.data,
            isRoot: false,
            onContext: (e, id) => {
              e.preventDefault();
              setNodeContextMenu({ x: e.clientX, y: e.clientY, nodeId: id });
            }
          }
        };
        setNodes(nds => [...nds, newNode]);
      }
    }
  };

  useEffect(() => {
    const closeMenus = () => {
      setEdgeContextMenu({ visible: false, x: 0, y: 0, edgeId: null });
      setNodeContextMenu({ x: 0, y: 0, nodeId: null });
    };

    const handleEdgeContext = e => {
      setEdgeContextMenu({ visible: true, x: e.detail.x, y: e.detail.y, edgeId: e.detail.id });
    };

    const handleEdgeTypeChange = e => {
      setEdges(eds =>
        eds.map(edge =>
          edge.id === e.detail.id ? { ...edge, data: { ...edge.data, type: e.detail.type } } : edge
        )
      );
      setEdgeContextMenu({ visible: false, x: 0, y: 0, edgeId: null });
    };

    const handleEdgeDelete = e => {
      setEdges(eds => eds.filter(edge => edge.id !== e.detail.id));
      setEdgeContextMenu({ visible: false, x: 0, y: 0, edgeId: null });
    };

    const handleGenerateVariants = () => {
      if (variantRef.current) variantRef.current();
    };

    const handleFitView = () => fitView();

    window.addEventListener('click', closeMenus);
    window.addEventListener('edge-context', handleEdgeContext);
    window.addEventListener('edge-type-change', handleEdgeTypeChange);
    window.addEventListener('edge-delete', handleEdgeDelete);
    window.addEventListener('generate', handleGenerateVariants);
    window.addEventListener('fit-view', handleFitView);

    return () => {
      window.removeEventListener('click', closeMenus);
      window.removeEventListener('edge-context', handleEdgeContext);
      window.removeEventListener('edge-type-change', handleEdgeTypeChange);
      window.removeEventListener('edge-delete', handleEdgeDelete);
      window.removeEventListener('generate', handleGenerateVariants);
      window.removeEventListener('fit-view', handleFitView);
    };
  }, [fitView, nodes]);

  const handleClearCanvas = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className={styles.canvas} onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        key={templateKey}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <Background />
        <Controls />
      </ReactFlow>

      <VariantGenerator
        ref={variantRef}
        nodes={nodes}
        edges={edges}
        rootId={rootNodeId || nodes[0]?.id}
        onGenerate={setPaths}
      />

      <Sidebar
        paths={paths}
        nodes={nodes}
        edges={edges}
        rootId={rootNodeId}
        onLoadTemplate={({ nodes: n, edges: e, rootId: r }) => {
          setNodes(
            n.map(node => ({
              ...node,
              data: {
                ...node.data,
                isRoot: node.id === r,
                onContext: (e, id) => {
                  e.preventDefault();
                  setNodeContextMenu({ x: e.clientX, y: e.clientY, nodeId: id });
                }
              }
            }))
          );
          setEdges(e);
          setRootNodeId(r);
          setPaths([]);
          setTemplateKey(Date.now());
          fitView();
        }}
        onClear={handleClearCanvas}
        onDownload={() => {
          const blob = new Blob([JSON.stringify(paths, null, 2)], { type: 'application/json' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'задачи.json';
          link.click();
        }}
      />

      {edgeContextMenu.visible && (
        <ContextMenu x={edgeContextMenu.x} y={edgeContextMenu.y} id={edgeContextMenu.edgeId} />
      )}

      <NodeContextMenu
        x={nodeContextMenu.x}
        y={nodeContextMenu.y}
        nodeId={nodeContextMenu.nodeId}
        onAction={handleNodeAction}
      />
    </div>
  );
};

const Canvas = () => (
  <ReactFlowProvider>
    <CanvasContent />
  </ReactFlowProvider>
);

export default Canvas;
