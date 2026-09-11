import os
import re
import sys
import subprocess

def run_tsc():
    log_path = r'C:\Users\Latitude\.gemini\antigravity-ide\brain\841c6c8e-2f4f-4796-ae9a-a94b6fefd03f\.system_generated\tasks\task-719.log'
    with open(log_path, 'r', encoding='utf-8') as f:
        return f.read()

def fix_ts_errors():
    output = run_tsc()
    lines = output.split('\n')
    
    unused_vars = {}
    for line in lines:
        if 'error TS6133' in line or 'error TS6196' in line:
            # src/App.tsx(36,3): error TS6133: 'Mountain' is declared but its value is never read.
            match = re.search(r'([^:]+)\((\d+),\d+\): error (?:TS6133|TS6196): \'([^\']+)\'', line)
            if match:
                filepath, linenum, varname = match.groups()
                filepath = os.path.join(r'e:\Benita granites', filepath)
                if filepath not in unused_vars:
                    unused_vars[filepath] = []
                unused_vars[filepath].append(varname)
                
    for filepath, vars in unused_vars.items():
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            for var in vars:
                # Remove from imports: import { var }
                content = re.sub(rf'\b{var}\b\s*,\s*', '', content)
                content = re.sub(rf',\s*\b{var}\b', '', content)
                content = re.sub(r'\{\s*\b' + var + r'\b\s*\}', '{}', content)
                # Remove standalone unused vars
                content = re.sub(rf'(?:const|let|var)\s+{var}\s*=\s*.*?;', '', content)
            
            # Clean up empty imports
            content = re.sub(r'import\s*\{\s*\}\s*from\s*[\'"].*?[\'"];?\n?', '', content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
                
    # DashboardPage specific fixes
    dash_path = r'e:\Benita granites\src\features\dashboard\DashboardPage.tsx'
    if os.path.exists(dash_path):
        with open(dash_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace('ease: [0.4, 0, 0.2, 1]', 'ease: "easeOut"')
        content = content.replace('formatter={(value: number) =>', 'formatter={(value: any) =>')
        with open(dash_path, 'w', encoding='utf-8') as f:
            f.write(content)

    # DailyLabourFormPage specific fixes
    labour_path = r'e:\Benita granites\src\features\employees\DailyLabourFormPage.tsx'
    if os.path.exists(labour_path):
        with open(labour_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace("'pending'", "'Pending'")
        with open(labour_path, 'w', encoding='utf-8') as f:
            f.write(content)

    # PurchaseFormPage specific fixes
    purchase_path = r'e:\Benita granites\src\features\purchases\PurchaseFormPage.tsx'
    if os.path.exists(purchase_path):
        with open(purchase_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace("'pending'", "'Pending'")
        with open(purchase_path, 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == '__main__':
    fix_ts_errors()
    print("Fixes applied.")
