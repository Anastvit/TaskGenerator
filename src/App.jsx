import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Generator from '@pages/Generator/Generator';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Generator />} />
      </Routes>
    </Router>
  );
}

export default App;
