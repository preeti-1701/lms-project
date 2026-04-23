import os
import re
import shutil
from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PREVIEW_DIR = os.path.join(BASE_DIR, '_preview')
TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')

def generate_preview():
    if os.path.exists(PREVIEW_DIR):
        shutil.rmtree(PREVIEW_DIR)
    os.makedirs(PREVIEW_DIR)
    
    # Copy static files
    shutil.copytree(STATIC_DIR, os.path.join(PREVIEW_DIR, 'static'))
    
    # Read base.html
    base_html_path = os.path.join(TEMPLATES_DIR, 'base.html')
    with open(base_html_path, 'r', encoding='utf-8') as f:
        base_content = f.read()

    # Find all HTML files
    for root, _, files in os.walk(TEMPLATES_DIR):
        for file in files:
            if not file.endswith('.html') or file == 'base.html':
                continue
            
            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, TEMPLATES_DIR)
            out_path = os.path.join(PREVIEW_DIR, rel_path)
            
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # If it doesn't extend base.html, just copy it (e.g., login.html)
            if '{% extends' not in content:
                # Replace static tags
                content = re.sub(r'{%\s*static\s+[\'"](.*?)[\'"]\s*%}', r'static/\1', content)
                content = re.sub(r'{%\s*load\s+static\s*%}', '', content)
                content = re.sub(r'{%\s*csrf_token\s*%}', '', content)
                
                with open(out_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                continue
            
            # Process blocks
            blocks = {}
            for match in re.finditer(r'{%\s*block\s+(\w+)\s*%}(.*?){%\s*endblock\s*%}', content, re.DOTALL):
                blocks[match.group(1)] = match.group(2)
            
            # Inject into base
            merged = base_content
            
            # Replace static tags in base and merged
            merged = re.sub(r'{%\s*static\s+[\'"](.*?)[\'"]\s*%}', r'/static/\1', merged)
            merged = re.sub(r'{%\s*load\s+static\s*%}', '', merged)
            merged = re.sub(r'{%\s*csrf_token\s*%}', '', merged)
            
            # Also handle if base has blocks that need replacement
            for block_name, block_content in blocks.items():
                pattern = r'{%\s*block\s+' + block_name + r'\s*%}(.*?){%\s*endblock\s*%}'
                merged = re.sub(pattern, block_content.replace('\\', '\\\\'), merged, flags=re.DOTALL)
            
            # Clear remaining blocks in base
            merged = re.sub(r'{%\s*block\s+\w+\s*%}.*?{\s*% endblock\s*%}', '', merged, flags=re.DOTALL)
            
            # Handle user context mock
            merged = merged.replace('{% if user.is_authenticated %}', '<!-- Mock Auth -->')
            merged = merged.replace('{% else %}', '<!-- Else -->')
            merged = merged.replace('{% endif %}', '')
            merged = merged.replace('{{ user.full_name|first|upper }}', 'A')
            merged = merged.replace('{{ user.full_name }}', 'Admin User')
            merged = merged.replace('{{ user.role }}', 'ADMIN')
            
            # Mock if statements for roles
            merged = re.sub(r'{%\s*if\s+user.role\s*==\s*\'ADMIN\'\s*%}', '', merged)
            merged = re.sub(r'{%\s*elif\s+user.role\s*==\s*\'TRAINER\'\s*%}(.*?){%\s*endif\s*%}', '', merged, flags=re.DOTALL)
            merged = re.sub(r'{%\s*if\s+user.role\s*!=\s*\'STUDENT\'\s*%}', '', merged)

            # Special case for django template language artifacts
            merged = re.sub(r'{%.*?%}', '', merged)
            merged = re.sub(r'{{.*?}}', '', merged)
            
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(merged)
                
    # Create an index.html that links to all pages
    index_html = """
    <!DOCTYPE html>
    <html>
    <head><title>LMS Previews</title>
    <style>body{font-family:sans-serif;padding:40px;background:#0f0f13;color:#fff;} a{color:#6366f1;text-decoration:none;display:block;margin:10px 0;font-size:1.2rem;} a:hover{text-decoration:underline;}</style>
    </head>
    <body>
    <h1>LMS Pages Preview</h1>
    <p>Since Django cannot run locally (no internet to download packages), here are the static HTML previews of what was built:</p>
    """
    for root, _, files in os.walk(PREVIEW_DIR):
        for file in files:
            if file.endswith('.html') and file != 'index.html':
                rel = os.path.relpath(os.path.join(root, file), PREVIEW_DIR)
                index_html += f'<a href="{rel}">{rel}</a>\n'
    index_html += "</body></html>"
    
    with open(os.path.join(PREVIEW_DIR, 'index.html'), 'w') as f:
        f.write(index_html)
        
    print(f"Generated static preview in {PREVIEW_DIR}")

if __name__ == '__main__':
    generate_preview()
    os.chdir(PREVIEW_DIR)
    port = 9000
    print(f"Serving static preview at http://127.0.0.1:{port}")
    server = HTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Stopping server.")
