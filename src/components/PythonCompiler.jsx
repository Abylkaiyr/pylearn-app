import { useState } from 'react';
import { Card, Button, Space, Typography, message, Input } from 'antd';
import { PlayCircleOutlined, ClearOutlined } from '@ant-design/icons';
import './PythonCompiler.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

let pyodide = null;

const PythonCompiler = ({ problem, onRunCode }) => {
  const [code, setCode] = useState(problem?.solution || '');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const loadPyodide = async () => {
    if (pyodide) return pyodide;
    
    try {
      // Dynamically import pyodide
      const pyodideModule = await import('pyodide');
      
      // Try to get the default indexURL from the package, or use the CDN URL for version 0.29.0
      // The package may provide a default indexURL, otherwise we'll use the CDN
      let indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/';
      
      // Check if pyodide provides a default indexURL
      if (pyodideModule.config && pyodideModule.config.indexURL) {
        indexURL = pyodideModule.config.indexURL;
      }
      
      pyodide = await pyodideModule.loadPyodide({
        indexURL: indexURL
      });
      return pyodide;
    } catch (error) {
      console.error('Error loading Pyodide:', error);
      // Provide more detailed error information
      const errorMessage = error.message || 'Unknown error';
      console.error('Pyodide error details:', errorMessage);
      message.error(`Failed to load Python compiler: ${errorMessage}. Please check your internet connection.`);
      return null;
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      message.warning('Please write some code first');
      return;
    }

    setLoading(true);
    setOutput('');

    try {
      const pyodideInstance = await loadPyodide();
      if (!pyodideInstance) {
        setOutput('Error: Could not load Python compiler');
        setLoading(false);
        return;
      }

      // Set up input function
      let inputIndex = 0;
      const inputLines = input.split('\n').filter(line => line.trim());
      
      pyodideInstance.runPython(`
import sys
from io import StringIO

class InputWrapper:
    def __init__(self, lines):
        self.lines = lines
        self.index = 0
    
    def readline(self):
        if self.index < len(self.lines):
            result = self.lines[self.index] + "\\n"
            self.index += 1
            return result
        return ""

input_wrapper = InputWrapper(${JSON.stringify(inputLines)})
sys.stdin = input_wrapper
      `);

      // Capture output
      pyodideInstance.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `);

      // Run user code
      try {
        pyodideInstance.runPython(code);
        const result = pyodideInstance.runPython('sys.stdout.getvalue()');
        const outputText = result ? String(result) : '';
        setOutput(outputText);
        
        if (onRunCode) {
          onRunCode(outputText);
        }
      } catch (error) {
        setOutput(`Error: ${error.message || error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message || 'An error occurred while running the code'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
    setInput('');
  };

  const loadSolution = () => {
    if (problem?.solution) {
      setCode(problem.solution);
    }
  };

  return (
    <Card className="compiler-card">
      <Title level={4}>Python Compiler</Title>
      
      <div className="compiler-section">
        <Text strong>Input (if required):</Text>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter input here (one line per input, if multiple)"
          rows={3}
          style={{ marginTop: 8, marginBottom: 16 }}
        />
      </div>

      <div className="compiler-section">
        <Space style={{ marginBottom: 8 }}>
          <Text strong>Code:</Text>
          <Button size="small" onClick={loadSolution}>
            Load Solution
          </Button>
        </Space>
        <TextArea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your Python code here..."
          rows={10}
          style={{ fontFamily: 'monospace' }}
        />
      </div>

      <Space style={{ marginTop: 16, marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={runCode}
          loading={loading}
        >
          Run Code
        </Button>
        <Button icon={<ClearOutlined />} onClick={clearCode}>
          Clear
        </Button>
      </Space>

      {output && (
        <div className="compiler-section">
          <Text strong>Output:</Text>
          <div className="output-box">
            <pre>{output}</pre>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PythonCompiler;

