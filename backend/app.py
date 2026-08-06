import os
import json
import traceback
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from github import Github
from github.GithubException import GithubException
import anthropic
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize API clients
github_token = os.getenv('GITHUB_TOKEN', '')
anthropic_key = os.getenv('ANTHROPIC_API_KEY', '')

gh = Github(github_token) if github_token else Github()
if anthropic_key and not anthropic_key.startswith('sk-or-'):
    anthropic_client = anthropic.Anthropic(api_key=anthropic_key)
else:
    anthropic_client = None

MOCK_REPO_DATA = {
    "nodes": [
        {"id": "root", "data": {"label": "my-repo", "type": "folder"}},
        {"id": "src", "data": {"label": "src", "type": "folder"}},
        {"id": "package.json", "data": {"label": "package.json", "type": "file"}},
        {"id": "src/index.js", "data": {"label": "index.js", "type": "file"}},
        {"id": "src/utils.js", "data": {"label": "utils.js", "type": "file"}}
    ],
    "edges": [
        {"id": "e-root-src", "source": "root", "target": "src"},
        {"id": "e-root-pkg", "source": "root", "target": "package.json"},
        {"id": "e-src-index", "source": "src", "target": "src/index.js"},
        {"id": "e-src-utils", "source": "src", "target": "src/utils.js"}
    ],
    "stats": {
        "files": 3,
        "folders": 2,
        "language": "JavaScript",
        "description": "Mock description for offline demo"
    },
    "tree_text": "my-repo/\n  src/\n    index.js\n    utils.js\n  package.json"
}

@app.route('/analyze', methods=['POST'])
def analyze_repo():
    data = request.json
    repo_url = data.get('url', '')
    
    if not repo_url:
        return jsonify({"error": "Repository URL is required"}), 400
        
    try:
        parts = repo_url.rstrip('/').split('/')
        owner, repo_name = parts[-2], parts[-1]
    except Exception:
        return jsonify({"error": "Invalid GitHub URL"}), 400
        
    try:
        repo = gh.get_repo(f"{owner}/{repo_name}")
        tree = repo.get_git_tree(repo.default_branch, recursive=True)
        
        langs = repo.get_languages()
        language = "Multi-lang"
        if langs and isinstance(langs, dict):
            # Filter out any non-integer metadata keys PyGithub might return
            valid_langs = {k: v for k, v in langs.items() if isinstance(v, int) or (isinstance(v, str) and v.isdigit())}
            if valid_langs:
                sorted_langs = sorted(valid_langs.items(), key=lambda x: int(x[1]), reverse=True)
                # Show up to top 2 languages
                language = ", ".join([l[0] for l in sorted_langs[:2]])
        
        nodes = [{"id": "root", "data": {"label": repo_name, "type": "folder"}}]
        edges = []
        
        folders_count = 0
        files_count = 0
        
        tree_elements = tree.tree
        limit = min(len(tree_elements), 200) # Limit for performance
        
        tree_text_lines = [f"{repo_name}/"]
        
        for item in tree_elements[:limit]:
            path = item.path
            parts = path.split('/')
            name = parts[-1]
            
            node_id = path
            item_type = "folder" if item.type == "tree" else "file"
            
            if item_type == "folder":
                folders_count += 1
            else:
                files_count += 1
                
            nodes.append({"id": node_id, "data": {"label": name, "type": item_type, "path": path}})
            
            parent_id = "root" if len(parts) == 1 else '/'.join(parts[:-1])
            edges.append({"id": f"e-{parent_id}-{node_id}", "source": parent_id, "target": node_id})
            
            indent = "  " * len(parts)
            tree_text_lines.append(f"{indent}{name}")
            
        return jsonify({
            "nodes": nodes,
            "edges": edges,
            "stats": {
                "files": files_count,
                "folders": folders_count,
                "language": language,
                "description": repo.description or "No description"
            },
            "tree_text": "\n".join(tree_text_lines[:200])
        })
        
    except GithubException as e:
        print(f"GitHub Error: {e}")
        return jsonify(MOCK_REPO_DATA)
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
        return jsonify(MOCK_REPO_DATA)

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    question = data.get('question')
    context = data.get('context', '')
    repo_url = data.get('url', '')
    mode = data.get('mode', 'developer')
    
    if not question:
        return jsonify({"error": "Question is required"}), 400
        
    if not anthropic_key:
        return jsonify({"answer": f"**Demo Mode**\nI see you're asking about '{question}'.\n\n(Note: Set ANTHROPIC_API_KEY in backend/.env for real RAG responses!)"})
        
    try:
        parts = repo_url.rstrip('/').split('/')
        owner, repo_name = parts[-2], parts[-1]
        repo = gh.get_repo(f"{owner}/{repo_name}")
        
        is_openrouter = anthropic_key.startswith('sk-or-')
        model_name = "anthropic/claude-3-haiku" if is_openrouter else "claude-3-haiku-20240307"
        
        # Helper function for making the AI call
        def call_ai(system_text, user_text, max_tokens):
            if is_openrouter:
                headers = {
                    "Authorization": f"Bearer {anthropic_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_text},
                        {"role": "user", "content": user_text}
                    ]
                }
                res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
                res.raise_for_status()
                return res.json()['choices'][0]['message']['content']
            else:
                res = anthropic_client.messages.create(
                    model=model_name,
                    max_tokens=max_tokens,
                    system=system_text,
                    messages=[{"role": "user", "content": user_text}]
                )
                return res.content[0].text

        # Step 1: Retrieval (Agentic)
        retrieval_prompt = (
            "You are an AI code retrieval agent. You are given a repository file tree and a user question. "
            "Your task is to identify up to 3 most relevant file paths from the tree that need to be read to answer the question. "
            "Return ONLY a JSON array of strings containing the exact file paths. Return an empty array [] if no files are needed. "
            "Do not include any other text."
        )
        retrieval_user = f"File Tree:\n{context}\n\nQuestion: {question}"
        
        retrieval_text = call_ai(retrieval_prompt, retrieval_user, 300)
        
        file_paths_str = retrieval_text.strip()
        try:
            if file_paths_str.startswith("```"):
                import re
                file_paths_str = re.sub(r"```json\n|\n```|```", "", file_paths_str).strip()
            files_to_read = json.loads(file_paths_str)
            if not isinstance(files_to_read, list):
                files_to_read = []
        except Exception:
            files_to_read = []
            
        files_to_read = files_to_read[:3]
        
        # Step 2: Fetch File Contents
        file_contents = []
        for path in files_to_read:
            try:
                file_obj = repo.get_contents(path)
                content = file_obj.decoded_content.decode('utf-8')
                if len(content) > 10000:
                    content = content[:10000] + "\n...[TRUNCATED]"
                file_contents.append(f"--- FILE: {path} ---\n{content}")
            except Exception:
                pass
                
        retrieved_context = "\n\n".join(file_contents) if file_contents else "No specific files retrieved."
        
        # Step 3: Final Answer
        if mode == 'beginner':
            system_prompt = (
                "You are an expert Developer Onboarding Copilot. You are helping a BEGINNER developer understand a codebase. "
                "Explain concepts very simply, avoid excessive jargon, and provide clear analogies where helpful. "
                "Use the provided repository file structure and the specifically retrieved file contents to answer the question. "
                "Keep your answers concise, practical, and formatted in Markdown."
            )
        else:
            system_prompt = (
                "You are an expert Developer Onboarding Copilot. You help experienced developers understand codebases. "
                "Use the provided repository file structure and the specifically retrieved file contents to answer the question. "
                "Cite the specific file paths in your answer to show exactly where the logic is implemented. "
                "Keep your answers concise, technical, practical, and formatted in Markdown."
            )
        
        user_prompt = f"Repository Context (File Tree):\n{context}\n\nRetrieved File Contents:\n{retrieved_context}\n\nDeveloper Question: {question}"
        
        final_text = call_ai(system_prompt, user_prompt, 1500)
        
        return jsonify({
            "answer": final_text,
            "retrieved_files": files_to_read
        })
    except Exception as e:
        print(f"Anthropic API Error: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/file', methods=['POST'])
def get_file_content():
    data = request.json
    repo_url = data.get('url', '')
    path = data.get('path', '')
    
    if not repo_url or not path:
        return jsonify({"error": "Repository URL and file path are required"}), 400
        
    try:
        parts = repo_url.rstrip('/').split('/')
        owner, repo_name = parts[-2], parts[-1]
        
        repo = gh.get_repo(f"{owner}/{repo_name}")
        file_content = repo.get_contents(path)
        
        return jsonify({
            "path": path,
            "content": file_content.decoded_content.decode('utf-8')
        })
    except GithubException as e:
        print(f"GitHub Error: {e}")
        return jsonify({"error": "File not found or cannot be read"}), 404
    except Exception as e:
        print(f"Error fetching file: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
