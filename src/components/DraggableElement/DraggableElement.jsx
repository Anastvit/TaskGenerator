const DraggableElement = ({ type, label }) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        padding: '8px',
        marginBottom: '8px',
        background: '#eee',
        cursor: 'grab',
        border: '1px solid #aaa'
      }}
    >
      {label}
    </div>
  );
};

export default DraggableElement;
