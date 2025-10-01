export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>DocFactory API</h1>
      <p>Lightweight Markdown to PDF/Image/Word/HTML conversion API</p>

      <h2>Quick Start</h2>
      <p>Convert Markdown documents to various formats using simple REST API calls.</p>

      <h3>Available Endpoints</h3>
      <ul>
        <li><code>POST /api/convert/pdf</code> - Convert to PDF</li>
        <li><code>POST /api/convert/image</code> - Convert to PNG/JPEG</li>
        <li><code>POST /api/convert/docx</code> - Convert to Word document</li>
        <li><code>POST /api/convert/html</code> - Convert to HTML</li>
        <li><code>GET /api/health</code> - Health check</li>
      </ul>

      <h3>Example Request</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>
{`curl -X POST https://docfactory.pages.dev/api/convert/pdf \\
  -H "Content-Type: application/json" \\
  -d '{
    "markdown": "# Hello World\\n\\nThis is a **test** document.",
    "options": {
      "format": "A4",
      "margin": "20px"
    }
  }' \\
  --output document.pdf`}
      </pre>

      <h3>Resources</h3>
      <ul>
        <li><a href="https://github.com/gongyug/DocFactory">GitHub Repository</a></li>
        <li><a href="/api/health">API Health Check</a></li>
      </ul>

      <footer style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #ddd', color: '#666' }}>
        <p>DocFactory v1.0.0 | MIT License</p>
      </footer>
    </div>
  );
}