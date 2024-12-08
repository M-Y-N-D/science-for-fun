import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { Info, RotateCw, Rocket, AlertTriangle } from 'lucide-react';

export default function SpacetimeVisualizer() {
  const [timeValue, setTimeValue] = useState(0);
  const [tensorValue, setTensorValue] = useState(0);
  const [lambdaValue, setLambdaValue] = useState(0);
  const [warpBubbleStrength, setWarpBubbleStrength] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [mode, setMode] = useState('2d');
  const [visualMode, setVisualMode] = useState('time');
  const [showMath, setShowMath] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  // Auto-rotation effect
  useEffect(() => {
    let animationFrame;
    if (animating && mode === '3d') {
      const animate = () => {
        setRotationAngle(angle => (angle + 1) % 360);
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [animating, mode]);

  // Alcubierre warp metric calculation (simplified)
  const calculateWarpMetric = (x, y) => {
    const R = Math.sqrt(x*x + y*y);
    const sigma = 2;
    const thickness = 1;
    
    // Simplified shape function for the warp bubble
    const shape = Math.exp(-Math.pow(R - warpBubbleStrength*10, 2) / (2 * sigma * sigma));
    
    // Negative energy density required (simplified)
    const energyDensity = -Math.abs(warpBubbleStrength) * shape / (8 * Math.PI);
    
    return { shape, energyDensity };
  };

  // Generate 2D data points with warp effects
  const generate2DData = () => {
    const points = [];
    
    for (let i = -10; i <= 10; i++) {
      const x = i;
      let y;
      
      if (visualMode === 'warp') {
        const { shape } = calculateWarpMetric(x, 0);
        y = shape * warpBubbleStrength * 5;
      } else if (visualMode === 'time') {
        y = (Math.pow(x - timeValue, 2) / 10) * (timeValue < 0 ? -1 : 1) + 
            (lambdaValue * Math.cos(x/2));
      } else {
        y = (tensorValue * Math.pow(x, 2) / 10) + 
            (lambdaValue * Math.sin(x/2));
      }
      
      points.push({
        x,
        y: y.toFixed(2)
      });
    }
    
    return points;
  };

  // Generate 3D surface data with rotation and warp effects
  const generate3DData = () => {
    const points = [];
    const resolution = 20;
    
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        const x = i;
        const y = j;
        
        // Apply rotation
        const rad = rotationAngle * Math.PI / 180;
        const rotX = x * Math.cos(rad) - y * Math.sin(rad);
        const rotY = x * Math.sin(rad) + y * Math.cos(rad);
        
        let z;
        
        if (visualMode === 'warp') {
          const { shape, energyDensity } = calculateWarpMetric(rotX, rotY);
          z = shape * warpBubbleStrength * 5;
        } else if (visualMode === 'time') {
          z = Math.pow(Math.sqrt(rotX*rotX + rotY*rotY) - timeValue, 2) / 5 +
              (lambdaValue * Math.cos(Math.sqrt(rotX*rotX + rotY*rotY)/2));
        } else {
          z = (tensorValue * (rotX*rotX + rotY*rotY) / 5) +
              (lambdaValue * Math.sin(Math.sqrt(rotX*rotX + rotY*rotY)/2));
        }
        
        points.push(`${x*20},${y*20},${z*20}`);
      }
    }
    
    return points;
  };

  const MathematicalDetails = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-bold mb-2">Mathematical Foundation</h3>
      <div className="space-y-2">
        <p>Einstein's Field Equations:</p>
        <p className="font-mono">Gμν + Λgμν = 8πG/c⁴ Tμν</p>
        
        {visualMode === 'warp' ? (
          <>
            <p className="mt-4">Alcubierre Metric:</p>
            <p className="font-mono">ds² = -c²dt² + [dx - v(t)f(r)dt]² + dy² + dz²</p>
            <p className="mt-2">Where f(r) is the shape function and v(t) is the velocity of the bubble.</p>
            <p className="mt-2">Required negative energy density:</p>
            <p className="font-mono">ρ = -(c²/8πG)(v²/4r²)(df/dr)²</p>
          </>
        ) : (
          <>
            <p className="mt-4">Current Parameters:</p>
            <ul className="list-disc pl-6">
              <li>Time (t): {timeValue}</li>
              <li>Tensor (T): {tensorValue}</li>
              <li>Lambda (Λ): {lambdaValue}</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Advanced Spacetime and Warp Drive Visualization
            <div className="flex gap-2">
              <button 
                onClick={() => setAnimating(!animating)}
                className="p-2 rounded-full hover:bg-gray-100"
                disabled={mode !== '3d'}
              >
                <RotateCw size={24} className={animating ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={() => setShowMath(!showMath)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Info size={24} />
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Tabs defaultValue="controls" className="w-full">
              <TabsList>
                <TabsTrigger value="controls">Controls</TabsTrigger>
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="controls" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="block">
                      Mode:
                      <select 
                        className="ml-2 p-1 border rounded"
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                      >
                        <option value="2d">2D View</option>
                        <option value="3d">3D View</option>
                      </select>
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block">
                      Visualization Type:
                      <select 
                        className="ml-2 p-1 border rounded"
                        value={visualMode}
                        onChange={(e) => setVisualMode(e.target.value)}
                      >
                        <option value="time">Time-based</option>
                        <option value="tensor">Tensor-based</option>
                        <option value="warp">Warp Drive</option>
                      </select>
                    </label>
                  </div>
                  
                  {visualMode === 'warp' ? (
                    <div className="space-y-2">
                      <label className="block">
                        Warp Bubble Strength:
                        <input
                          type="range"
                          min="-10"
                          max="10"
                          step="0.1"
                          value={warpBubbleStrength}
                          onChange={(e) => setWarpBubbleStrength(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <span className="ml-2">{warpBubbleStrength}</span>
                      </label>
                      {Math.abs(warpBubbleStrength) > 5 && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Warning: High warp bubble strength requires significant negative energy density
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="block">
                          Time Value (t):
                          <input
                            type="range"
                            min="-10"
                            max="10"
                            step="0.1"
                            value={timeValue}
                            onChange={(e) => setTimeValue(parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <span className="ml-2">{timeValue}</span>
                        </label>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block">
                          Tensor Value (T):
                          <input
                            type="range"
                            min="-10"
                            max="10"
                            step="0.1"
                            value={tensorValue}
                            onChange={(e) => setTensorValue(parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <span className="ml-2">{tensorValue}</span>
                        </label>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block">
                          Cosmological Constant (Λ):
                          <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.1"
                            value={lambdaValue}
                            onChange={(e) => setLambdaValue(parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <span className="ml-2">{lambdaValue}</span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="visualization">
                <div className="h-96 w-full">
                  {mode === '2d' ? (
                    <LineChart
                      width={600}
                      height={350}
                      data={generate2DData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" />
                      <YAxis />
                      <Tooltip />
                      <ReferenceLine y={0} stroke="#666" />
                      <ReferenceLine x={0} stroke="#666" />
                      <Line type="monotone" dataKey="y" stroke="#8884d8" dot={false} />
                    </LineChart>
                  ) : (
                    <svg 
                      viewBox="-100 -100 200 200" 
                      className="w-full h-full"
                    >
                      {generate3DData().map((point, i) => {
                        const [x, y, z] = point.split(',').map(Number);
                        return (
                          <circle
                            key={i}
                            cx={x - y/2}
                            cy={y/2 + z}
                            r="1"
                            fill={visualMode === 'warp' ? 
                              `hsl(${240 + z}, 70%, ${50 + warpBubbleStrength * 5}%)` :
                              `hsl(${240 + z}, 70%, 50%)`
                            }
                          />
                        );
                      })}
                    </svg>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {showMath && <MathematicalDetails />}

            <Alert>
              <AlertDescription>
                {visualMode === 'warp' ? (
                  `Warp bubble strength: ${warpBubbleStrength}. ${
                    Math.abs(warpBubbleStrength) > 5 ? 
                    'Warning: Significant negative energy density required.' :
                    'Moderate spacetime distortion within acceptable parameters.'
                  }`
                ) : visualMode === 'time' ? (
                  `Time value (t=${timeValue}) affects spacetime curvature ${
                    timeValue === 0 ? 'at the present moment' :
                    timeValue > 0 ? 'in the future' : 'in the past'
                  }. Λ=${lambdaValue} ${
                    lambdaValue > 0 ? 'expands' : 
                    lambdaValue < 0 ? 'contracts' : 
                    'maintains'
                  } space.`
                ) : (
                  `Tensor value (T=${tensorValue}) represents ${
                    tensorValue === 0 ? 'empty space' :
                    tensorValue > 0 ? 'normal matter' : 'exotic matter'
                  }. Λ=${lambdaValue} affects large-scale structure.`
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
