import MenuPanel from '@components/MenuPanel';
import Canvas from '@components/Canvas';

const Generator = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MenuPanel />
      <Canvas />
    </div>
  );
};

export default Generator;
