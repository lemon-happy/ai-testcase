#!/usr/bin/env python3
"""Generate an interactive codebase analysis page with file descriptions."""

import json
import sys
import webbrowser
from pathlib import Path
from collections import Counter

IGNORE = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build', '.next', 'coverage', '.pytest_cache'}

# File descriptions based on name, extension, and path patterns
FILE_DESCRIPTIONS = {
    # Config files
    'package.json': '🔧 Node.js package manifest and dependencies',
    'package-lock.json': '🔒 Locked dependency versions for reproducible installs',
    'tsconfig.json': '⚙️ TypeScript compiler configuration',
    'jest.config.js': '🧪 Jest testing framework configuration',
    'babel.config.js': '🔄 Babel transpiler configuration',
    'webpack.config.js': '📦 Webpack bundler configuration',
    'vite.config.ts': '⚡ Vite build tool configuration',
    'next.config.js': '🚀 Next.js framework configuration',
    'tailwind.config.ts': '🎨 Tailwind CSS configuration',
    'postcss.config.js': '🎨 PostCSS plugin configuration',
    'eslintrc.json': '✓ ESLint code style rules',
    'prettierrc.json': '✨ Prettier code formatter config',
    '.gitignore': '🚫 Git ignore patterns',
    '.env': '🔐 Environment variables (sensitive)',
    '.env.local': '🔐 Local environment overrides',
    '.env.example': '📋 Example environment template',
    'docker-compose.yml': '🐳 Docker multi-container setup',
    'Dockerfile': '🐳 Docker image definition',
    '.dockerignore': '🐳 Docker ignore patterns',
    'Makefile': '⚙️ Build automation recipes',
    'Procfile': '⚙️ Heroku process type definitions',
    'requirements.txt': '📦 Python package dependencies',
    'setup.py': '📦 Python package setup script',
    'pyproject.toml': '📦 Python project configuration',
    'poetry.lock': '🔒 Poetry locked dependencies',
    'Gemfile': '💎 Ruby bundle dependencies',
    'Gemfile.lock': '🔒 Ruby locked dependencies',
    'go.mod': '📦 Go module dependencies',
    'go.sum': '🔒 Go module checksums',
    'Cargo.toml': '🦀 Rust package manifest',
    'Cargo.lock': '🔒 Rust locked dependencies',

    # Documentation
    'README.md': '📖 Project overview and getting started guide',
    'CHANGELOG.md': '📝 Version history and release notes',
    'CONTRIBUTING.md': '🤝 Contribution guidelines',
    'LICENSE': '⚖️ Software license terms',
    'CLAUDE.md': '🤖 Claude Code project instructions',
    'docs/': '📚 Documentation directory',

    # Source code directories
    'src/': '💻 Source code directory',
    'lib/': '📚 Library code directory',
    'utils/': '🛠️ Utility functions directory',
    'helpers/': '🛠️ Helper functions directory',
    'components/': '⚛️ React/UI components directory',
    'pages/': '📄 Page components or routes',
    'app/': '🚀 Application entry point or routing',
    'api/': '🔌 API endpoints directory',
    'routes/': '🛣️ HTTP route definitions',
    'controllers/': '🎛️ Request handler controllers',
    'services/': '⚙️ Business logic services',
    'models/': '🗄️ Data models or schemas',
    'middleware/': '🔀 Middleware functions',
    'hooks/': '🎣 React hooks directory',
    'types/': '📝 TypeScript type definitions',
    'interfaces/': '📝 Interface definitions',
    'styles/': '🎨 CSS and styling files',
    'assets/': '🎨 Images, fonts, and media',
    'public/': '🌐 Public static files',
    'tests/': '🧪 Test files directory',
    'spec/': '🧪 Test specifications',
    '__tests__/': '🧪 Jest test directory',
    '.test.ts': '🧪 Unit test file',
    '.spec.ts': '🧪 Specification test file',

    # Database
    'migrations/': '🗄️ Database migration scripts',
    'seeds/': '🌱 Database seed files',
    'prisma/': '🔗 Prisma ORM configuration',
    'schema.prisma': '🔗 Prisma database schema',
    '.sql': '🗄️ SQL database script',

    # Build and output
    'dist/': '📦 Compiled/built output directory',
    'build/': '📦 Build output directory',
    '.next/': '🚀 Next.js compiled output',
    'out/': '📦 Output directory',
    'coverage/': '📊 Test coverage reports',
}

def get_description(name: str, path_parts: list) -> str:
    """Get description for a file or directory."""
    # Check exact filename match
    if name in FILE_DESCRIPTIONS:
        return FILE_DESCRIPTIONS[name]

    # Check path patterns (e.g., 'src/', 'components/')
    for pattern, desc in FILE_DESCRIPTIONS.items():
        if pattern.endswith('/') and name == pattern[:-1]:
            return desc

    # Check extension patterns
    ext = Path(name).suffix.lower()
    if ext:
        ext_descriptions = {
            '.ts': '📘 TypeScript source file',
            '.tsx': '⚛️ React TypeScript component',
            '.js': '📕 JavaScript source file',
            '.jsx': '⚛️ React JavaScript component',
            '.py': '🐍 Python source file',
            '.go': '🐹 Go source file',
            '.rs': '🦀 Rust source file',
            '.rb': '💎 Ruby source file',
            '.java': '☕ Java source file',
            '.cpp': '🔧 C++ source file',
            '.c': '🔧 C source file',
            '.h': '🔧 C/C++ header file',
            '.cs': '#️⃣ C# source file',
            '.php': '🐘 PHP source file',
            '.swift': '🍎 Swift source file',
            '.kt': '🚀 Kotlin source file',
            '.vue': '💚 Vue.js component',
            '.css': '🎨 CSS stylesheet',
            '.scss': '🎨 SCSS stylesheet',
            '.less': '🎨 Less stylesheet',
            '.html': '🌐 HTML markup',
            '.json': '📋 JSON data file',
            '.yaml': '⚙️ YAML configuration',
            '.yml': '⚙️ YAML configuration',
            '.toml': '⚙️ TOML configuration',
            '.xml': '📝 XML data file',
            '.md': '📖 Markdown documentation',
            '.mdx': '📖 Markdown with JSX',
            '.txt': '📄 Text file',
            '.log': '📋 Log file',
            '.env': '🔐 Environment variables',
            '.sh': '🔧 Shell script',
            '.bash': '🔧 Bash script',
            '.zsh': '🔧 Zsh script',
            '.sql': '🗄️ SQL database script',
            '.graphql': '📊 GraphQL schema',
            '.proto': '📦 Protocol Buffer definition',
            '.gql': '📊 GraphQL query',
        }
        if ext in ext_descriptions:
            return ext_descriptions[ext]

    # Default descriptions
    return '📄 File'

def scan(path: Path, stats: dict) -> dict:
    """Recursively scan directory tree."""
    result = {"name": path.name, "children": [], "size": 0, "desc": ""}
    try:
        path_parts = path.parts
        result["desc"] = get_description(path.name, list(path_parts))

        for item in sorted(path.iterdir()):
            if item.name in IGNORE or item.name.startswith('.'):
                continue
            if item.is_file():
                size = item.stat().st_size
                ext = item.suffix.lower() or '(no ext)'
                desc = get_description(item.name, list(item.parts))
                result["children"].append({
                    "name": item.name,
                    "size": size,
                    "ext": ext,
                    "desc": desc
                })
                result["size"] += size
                stats["files"] += 1
                stats["extensions"][ext] += 1
                stats["ext_sizes"][ext] += size
            elif item.is_dir():
                stats["dirs"] += 1
                child = scan(item, stats)
                if child["children"]:
                    result["children"].append(child)
                    result["size"] += child["size"]
    except PermissionError:
        pass
    return result

def generate_html(data: dict, stats: dict, output: Path) -> None:
    """Generate interactive HTML visualization with modern flat design."""
    ext_sizes = stats["ext_sizes"]
    total_size = sum(ext_sizes.values()) or 1
    sorted_exts = sorted(ext_sizes.items(), key=lambda x: -x[1])[:8]
    colors = {
        '.js': '#f7df1e', '.ts': '#3178c6', '.py': '#3776ab', '.go': '#00add8',
        '.rs': '#dea584', '.rb': '#cc342d', '.css': '#264de4', '.html': '#e34c26',
        '.json': '#6b7280', '.md': '#083fa1', '.yaml': '#cb171e', '.yml': '#cb171e',
        '.mdx': '#083fa1', '.tsx': '#3178c6', '.jsx': '#61dafb', '.sh': '#4eaa25',
        '.sql': '#ff6b6b', '.graphql': '#e535ab', '.proto': '#0066cc', '.toml': '#9b59b6'
    }
    lang_bars = "".join(
        f'<div class="bar-row"><span class="bar-label">{ext}</span>'
        f'<div class="bar" style="background:{colors.get(ext,"#6b7280")}"></div>'
        f'<span class="bar-pct">{(size/total_size)*100:.1f}%</span></div>'
        for ext, size in sorted_exts
    )

    def fmt(b):
        if b < 1024: return f"{b} B"
        if b < 1048576: return f"{b/1024:.1f} KB"
        return f"{b/1048576:.1f} MB"

    html = f'''<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"><title>Codebase Analysis</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      min-height: 100vh;
    }}
    .container {{ display: flex; height: 100vh; }}

    /* Sidebar Styles */
    .sidebar {{
      width: 360px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      padding: 32px 28px;
      border-right: 1px solid #334155;
      overflow-y: auto;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }}

    .sidebar::-webkit-scrollbar {{ width: 8px; }}
    .sidebar::-webkit-scrollbar-track {{ background: #1e293b; }}
    .sidebar::-webkit-scrollbar-thumb {{ background: #475569; border-radius: 4px; }}

    .summary-card {{
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
      backdrop-filter: blur(10px);
    }}

    h1 {{
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }}

    h2 {{
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 24px;
      margin-bottom: 16px;
    }}

    .stats-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }}

    .stat {{
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #334155;
      transition: all 0.3s ease;
    }}

    .stat:hover {{
      background: rgba(30, 41, 59, 0.8);
      border-color: #475569;
      transform: translateY(-2px);
    }}

    .stat-label {{
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}

    .stat-value {{
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }}

    .bar-row {{
      display: flex;
      align-items: center;
      margin-bottom: 14px;
      gap: 12px;
    }}

    .bar-label {{
      width: 45px;
      font-size: 13px;
      color: #cbd5e1;
      font-weight: 500;
      flex-shrink: 0;
    }}

    .bar {{
      flex: 1;
      height: 24px;
      border-radius: 6px;
      opacity: 0.85;
      transition: opacity 0.3s ease;
    }}

    .bar:hover {{ opacity: 1; }}

    .bar-pct {{
      font-size: 12px;
      color: #cbd5e1;
      font-weight: 600;
      width: 50px;
      text-align: right;
    }}

    /* Main Content */
    .main {{
      flex: 1;
      padding: 40px 48px;
      overflow-y: auto;
      background: linear-gradient(135deg, #0f172a 0%, #1a1f35 100%);
    }}

    .main::-webkit-scrollbar {{ width: 8px; }}
    .main::-webkit-scrollbar-track {{ background: #0f172a; }}
    .main::-webkit-scrollbar-thumb {{ background: #475569; border-radius: 4px; }}

    .main h1 {{
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 32px;
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }}

    /* Tree Structure */
    .tree {{
      list-style: none;
      padding-left: 0;
    }}

    .tree li {{
      margin-bottom: 4px;
    }}

    details {{
      cursor: pointer;
    }}

    details > summary::-webkit-details-marker {{
      display: none;
    }}

    summary {{
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 8px;
      user-select: none;
      font-size: 16px;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
      position: relative;
    }}

    summary:before {{
      content: "▶";
      display: inline-block;
      width: 20px;
      color: #64748b;
      font-size: 12px;
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }}

    details[open] > summary:before {{
      transform: rotate(90deg);
    }}

    summary:hover {{
      background: rgba(148, 163, 184, 0.1);
      color: #60a5fa;
    }}

    .folder {{
      color: #fbbf24;
      font-weight: 600;
    }}

    .file-desc {{
      color: #94a3b8;
      font-size: 14px;
      flex: 1;
      margin: 0 8px;
    }}

    .size {{
      color: #64748b;
      font-size: 14px;
      white-space: nowrap;
      font-weight: 500;
      flex-shrink: 0;
    }}

    .file {{
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.2s ease;
    }}

    .file:hover {{
      background: rgba(148, 163, 184, 0.1);
      color: #60a5fa;
    }}

    .file span:first-child {{
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    .dot {{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 8px rgba(96, 165, 250, 0.3);
    }}

    .tree > li > details > ul {{
      padding-left: 12px;
      border-left: 2px solid #334155;
      margin-left: 10px;
      padding-top: 4px;
    }}
  </style>
</head><body>
  <div class="container">
    <div class="sidebar">
      <div class="summary-card">
        <h1>📊 Summary</h1>
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-label">Files</div>
            <div class="stat-value">{stats["files"]:,}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Directories</div>
            <div class="stat-value">{stats["dirs"]:,}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Size</div>
            <div class="stat-value">{fmt(data["size"])}</div>
          </div>
          <div class="stat">
            <div class="stat-label">File Types</div>
            <div class="stat-value">{len(stats["extensions"])}</div>
          </div>
        </div>
      </div>

      <h2>File Type Distribution</h2>
      {lang_bars}
    </div>
    <div class="main">
      <h1>📁 {data["name"]}</h1>
      <ul class="tree" id="root"></ul>
    </div>
  </div>
  <script>
    const data = {json.dumps(data)};
    const colors = {json.dumps(colors)};
    function fmt(b) {{ if (b < 1024) return b + ' B'; if (b < 1048576) return (b/1024).toFixed(1) + ' KB'; return (b/1048576).toFixed(1) + ' MB'; }}
    function render(node, parent) {{
      if (node.children) {{
        const det = document.createElement('details');
        det.open = parent === document.getElementById('root');
        const summary = document.createElement('summary');

        const folder = document.createElement('span');
        folder.className = 'folder';
        folder.textContent = '📁 ' + node.name;

        const desc = document.createElement('span');
        desc.className = 'file-desc';
        desc.textContent = node.desc || '';

        const size = document.createElement('span');
        size.className = 'size';
        size.textContent = fmt(node.size);

        summary.appendChild(folder);
        if (node.desc) summary.appendChild(desc);
        summary.appendChild(size);
        det.appendChild(summary);

        const ul = document.createElement('ul');
        ul.className = 'tree';
        node.children.sort((a,b) => (b.children?1:0)-(a.children?1:0) || a.name.localeCompare(b.name));
        node.children.forEach(c => render(c, ul));
        det.appendChild(ul);

        const li = document.createElement('li');
        li.appendChild(det);
        parent.appendChild(li);
      }} else {{
        const li = document.createElement('li');
        li.className = 'file';

        const nameSpan = document.createElement('span');

        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.style.background = colors[node.ext] || '#6b7280';
        nameSpan.appendChild(dot);

        const fileName = document.createElement('span');
        fileName.textContent = node.name;
        nameSpan.appendChild(fileName);

        li.appendChild(nameSpan);

        if (node.desc) {{
          const desc = document.createElement('span');
          desc.className = 'file-desc';
          desc.textContent = node.desc;
          li.appendChild(desc);
        }}

        const size = document.createElement('span');
        size.className = 'size';
        size.textContent = fmt(node.size);
        li.appendChild(size);

        parent.appendChild(li);
      }}
    }}
    data.children.forEach(c => render(c, document.getElementById('root')));
  </script>
</body></html>'''
    output.write_text(html)

if __name__ == '__main__':
    target = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
    stats = {"files": 0, "dirs": 0, "extensions": Counter(), "ext_sizes": Counter()}
    data = scan(target, stats)
    out = Path('codebase-analysis.html')
    generate_html(data, stats, out)
    print(f'Generated {out.absolute()}')
    webbrowser.open(f'file://{out.absolute()}')
