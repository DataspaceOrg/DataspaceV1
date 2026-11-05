# Bash script stop on common errors. 
set -euo pipefail

if command -v brew >/dev/null 2>&1; then
    echo "Homebrew installed"
    echo "Version: $(brew --version | head -n 1)"
else
    echo "No homebrew found"

    # Install homebrew on mac. 
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo "Follow Homebrew's printed Next steps, then rerun this script."

    exit 0
fi 

if ! command -v az >/dev/null 2>&1; then
    brew install azure-cli
fi

az login

# Python instance creation

if ! command -v python3.13 >/dev/null 2>&1; then
    brew install python@3.13
fi

if [[ ! -d env ]]; then
    python3.13 -m venv env
fi

env/bin/python -m pip install -r requirements.txt

exec env/bin/python -m uvicorn main:app --reload

# bash run-backend-mac.sh