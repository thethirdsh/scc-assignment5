import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedKey, setSelectedKey] = useState('');

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:3001/files');
      const files = await response.json();
      setFiles(files);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileSelection = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
      setSelectedFile(null);
      await fetchFiles();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3001/file/${selectedKey}`, {
        method: 'DELETE',
      });
      setSelectedKey('');
      await fetchFiles();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <div className="Table">
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.key}>
                <td>{file.key}</td>
                <td>{file.size} bytes</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="Actions">
        <div className="Action">
          <input type="file" onChange={handleFileSelection} />
          <button onClick={handleUpload} disabled={!selectedFile}>
            Upload
          </button>
        </div>
        <div className="Action">
          <input
            type="text"
            placeholder="Key"
            value={selectedKey}
            onChange={(event) => setSelectedKey(event.target.value)}
          />
          <button onClick={handleDelete} disabled={!selectedKey}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;