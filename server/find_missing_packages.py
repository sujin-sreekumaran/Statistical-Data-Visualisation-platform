import os
import ast
import pkg_resources

def get_imports(file_path):
    with open(file_path, 'r') as file:
        tree = ast.parse(file.read())
    
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name.split('.')[0])
        elif isinstance(node, ast.ImportFrom):
            if node.level == 0:  # absolute import
                imports.add(node.module.split('.')[0])
    
    return imports

def get_project_imports(directory):
    all_imports = set()
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                all_imports.update(get_imports(file_path))
    return all_imports

def get_installed_packages():
    return {pkg.key for pkg in pkg_resources.working_set}

def get_requirements():
    try:
        with open('requirements.txt', 'r') as file:
            return {line.strip().split('==')[0].lower() for line in file if line.strip() and not line.startswith('#')}
    except FileNotFoundError:
        print("requirements.txt not found.")
        return set()

# Main execution
project_imports = get_project_imports('.')
installed_packages = get_installed_packages()
requirements = get_requirements()

# Find missing packages
missing_packages = project_imports - requirements - set(['flask', 'werkzeug'])  
missing_packages = {pkg for pkg in missing_packages if pkg in installed_packages}

if missing_packages:
    print("Packages used in the project but not listed in requirements.txt:")
    for package in sorted(missing_packages):
        print(f"- {package}")
else:
    print("All used packages are listed in requirements.txt")

# Suggest versions for missing packages
if missing_packages:
    print("\nSuggested versions to add to requirements.txt:")
    for package in sorted(missing_packages):
        try:
            version = pkg_resources.get_distribution(package).version
            print(f"{package}=={version}")
        except pkg_resources.DistributionNotFound:
            print(f"{package} (version not found)")
