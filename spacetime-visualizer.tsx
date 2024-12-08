import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

export default function SpacetimeVisualizer() {
  const [timeValue, setTimeValue] = useState(0);
  const [tensorValue, setTensorValue] = useState(0);
  const [mode, setMode] = useState('time'); // 'time' or 'tensor'

  // Generate data points for the visualization
  const generateData = () => {
    const points = [];
    const steps = 20;
    
    for (let i = -10; i <= 10; i++) {
      const x = i;
      let y;
      
      if (mode === 'time') {
        // Simulate spacetime curvature based on time value
        y = Math.pow(x - timeValue, 2) / 10 * (timeValue < 0 ? -1 : 1);
      } else {
        // Simulate spacetime curvature based on tensor value
        y = tensorValue * Math.pow(x, 2) / 10;
      }
      
      points.push({
        x,
        y: y.toFixed(2)
      });
    }
    
    return points;
  };

  return (
    <div className="w-full max-w-4xl p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Spacetime Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4 mb-4">
              <button
                className={`px-4 py-2 rounded ${mode === 'time' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setMode('time')}
              >
                Time Mode
              </button>
              <button
                className={`px-4 py-2 rounded ${mode === 'tensor' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setMode('tensor')}
              >
                Tensor Mode
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="block">
                {mode === 'time' ? 'Time Value' : 'Tensor Value'} ({mode === 'time' ? 't' : 'T'}):
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={mode === 'time' ? timeValue : tensorValue}
                  onChange={(e) => {
                    if (mode === 'time') {
                      setTimeValue(parseFloat(e.target.value));
                    } else {
                      setTensorValue(parseFloat(e.target.value));
                    }
                  }}
                  className="w-full"
                />
                <span className="ml-2">
                  {mode === 'time' ? timeValue : tensorValue}
                </span>
              </label>
            </div>

            <div className="h-64 w-full">
              <LineChart
                width={600}
                height={250}
                data={generateData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <ReferenceLine y={0} stroke="#666" />
                <ReferenceLine x={0} stroke="#666" />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  stroke="#8884d8" 
                  dot={false}
                />
              </LineChart>
            </div>

            <Alert className="mt-4">
              <AlertDescription>
                {mode === 'time' ? (
                  timeValue === 0 ? (
                    "At t=0, this represents the 'present moment' in our reference frame. The spacetime curvature is symmetric."
                  ) : timeValue > 0 ? (
                    "Positive time values represent the future, showing how spacetime curves forward."
                  ) : (
                    "Negative time values represent the past, showing how spacetime curves backward."
                  )
                ) : (
                  tensorValue === 0 ? (
                    "When T=0, this represents empty space with no stress-energy content."
                  ) : tensorValue > 0 ? (
                    "Positive tensor values represent normal matter and energy, causing attractive gravity."
                  ) : (
                    "Negative tensor values represent exotic matter, potentially causing repulsive gravity."
                  )
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
