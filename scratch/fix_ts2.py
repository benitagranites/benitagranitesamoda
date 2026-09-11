import os

def fix_errors():
    dash_path = r'e:\Benita granites\src\features\dashboard\DashboardPage.tsx'
    if os.path.exists(dash_path):
        with open(dash_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove transition entirely from itemVariants
        content = content.replace("transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }", "transition: { duration: 0.4 }")
        # I previously changed it to "easeOut", so I need to replace that as well if it exists
        content = content.replace('transition: { duration: 0.4, ease: "easeOut" }', "transition: { duration: 0.4 }")
        
        with open(dash_path, 'w', encoding='utf-8') as f:
            f.write(content)

    labour_path = r'e:\Benita granites\src\features\employees\DailyLabourFormPage.tsx'
    if os.path.exists(labour_path):
        with open(labour_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace("'Pending'", "'submitted'")
        with open(labour_path, 'w', encoding='utf-8') as f:
            f.write(content)

    purchase_path = r'e:\Benita granites\src\features\purchases\PurchaseFormPage.tsx'
    if os.path.exists(purchase_path):
        with open(purchase_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace("'Pending'", "'submitted'")
        with open(purchase_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    # DailyLabourListPage unused variables
    list_path = r'e:\Benita granites\src\features\employees\DailyLabourListPage.tsx'
    if os.path.exists(list_path):
        with open(list_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace("const navigate = useNavigate();", "")
        content = content.replace("import { useNavigate } from 'react-router-dom';", "")
        with open(list_path, 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == '__main__':
    fix_errors()
    print("Fixes applied.")
