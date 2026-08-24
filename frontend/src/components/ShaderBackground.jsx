import React, { useEffect, useRef, useMemo } from 'react';

// Vertex shader source code
const vsSource = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`;

// Fragment shader source code
const fsSource = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec3 uLineColor;
  uniform vec3 uBackgroundColor;

  const float overallSpeed = 0.2;
  const float gridSmoothWidth = 0.015;
  const float axisWidth = 0.05;
  const float majorLineWidth = 0.025;
  const float minorLineWidth = 0.0125;
  const int linesPerGroup = 4;

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) * 0.3333;
  }

  float getPlasmaY(float x, float horizontalFade, float offset, float iTime) {
    return random(x * 0.2 + iTime * 0.2) * horizontalFade * 1.0 + offset;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 space = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.x * 10.0;

    float horizontalFade = 1.0 - (cos(uv.x * 6.28318) * 0.5 + 0.5);
    float verticalFade = 1.0 - (cos(uv.y * 6.28318) * 0.5 + 0.5);

    float warpX = random(space.x * 0.5 + iTime * 0.04);
    float warpY = random(space.y * 0.5 + iTime * 0.04 + 2.0);
    
    space.y += warpX * (0.5 + horizontalFade);
    space.x += warpY * horizontalFade;

    vec4 lines = vec4(0.0);
    for(int l = 0; l < 4; l++) {
      float normalizedLineIndex = float(l) / 4.0;
      float offsetPosition = float(l) + space.x * 0.5;
      float rand = random(offsetPosition + iTime * 0.26) * 0.5 + 0.5;
      float halfWidth = mix(0.01, 0.2, rand * horizontalFade) * 0.5;
      float offset = random(offsetPosition + (iTime * 0.26) * (1.0 + normalizedLineIndex)) * mix(0.6, 2.0, horizontalFade);
      float linePosition = getPlasmaY(space.x, horizontalFade, offset, iTime);
      float lineIntensity = smoothstep(halfWidth, 0.0, abs(linePosition - space.y)) * 0.5 + smoothstep(halfWidth * 0.15 + 0.015, halfWidth * 0.15, abs(linePosition - space.y));

      lines += lineIntensity * vec4(uLineColor, 1.0) * rand;
    }

    gl_FragColor = vec4(uBackgroundColor * verticalFade, 1.0) + lines;
  }
`;

const ShaderBackground = ({ 
  lineColor = [1.0, 0.05, 0.6],
  backgroundColor = [0.0, 0.0, 0.0]
}) => {
  const canvasRef = useRef(null);
  
  // Memoize properties to avoid re-renders if passed ad-hoc
  const memoLineColor = useMemo(() => lineColor, [lineColor[0], lineColor[1], lineColor[2]]);
  const memoBgColor = useMemo(() => backgroundColor, [backgroundColor[0], backgroundColor[1], backgroundColor[2]]);

  useEffect(() => {
    const loadShader = (gl, type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const initShaderProgram = (gl, vsSource, fsSource) => {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);
      return shaderProgram;
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, depth: false });
    if (!gl) return;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const programInfo = {
      program: shaderProgram,
      attribLocations: { vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition') },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
        time: gl.getUniformLocation(shaderProgram, 'iTime'),
        lineColor: gl.getUniformLocation(shaderProgram, 'uLineColor'),
        backgroundColor: gl.getUniformLocation(shaderProgram, 'uBackgroundColor'),
      },
    };

    const resizeCanvas = () => {
      // DOWNSAMPLING: Render at max 1280px width for performance
      const scale = Math.min(1, 1280 / window.innerWidth);
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let start = Date.now();
    let frame;
    const render = () => {
      const time = (Date.now() - start) / 1000;
      gl.useProgram(programInfo.program);
      gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
      gl.uniform1f(programInfo.uniformLocations.time, time);
      gl.uniform3f(programInfo.uniformLocations.lineColor, memoLineColor[0], memoLineColor[1], memoLineColor[2]);
      gl.uniform3f(programInfo.uniformLocations.backgroundColor, memoBgColor[0], memoBgColor[1], memoBgColor[2]);

      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frame = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(frame);
      gl.deleteProgram(shaderProgram);
      gl.deleteBuffer(positionBuffer);
    };
  }, [memoLineColor, memoBgColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10" 
      style={{ imageRendering: 'auto', objectFit: 'cover' }}
    />
  );
};

export default ShaderBackground;
