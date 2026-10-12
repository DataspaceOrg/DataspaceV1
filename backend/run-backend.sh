# Bash script stop on common errors. 
set -euo pipefail

if command -v brew >/dev/null 2>&1; then
    echo "Homebrew installed"
    echo "Version: $(brew --version | head -n 1)"
else
    echo "No homebrew found"

    # Install homebrew on mac. 

fi 

exec env/bin/python -m uvicorn main:app --reload