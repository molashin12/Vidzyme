#!/usr/bin/env python3
import os
import re
import glob

def resolve_merge_conflicts(directory):
    """Resolve all merge conflicts by accepting HEAD version"""
    conflict_pattern = re.compile(r'<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> [a-f0-9]+', re.DOTALL)
    
    # Find all files that might have conflicts
    file_patterns = ['*.md', '*.py', '*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.sql']
    files_to_check = []
    
    for pattern in file_patterns:
        files_to_check.extend(glob.glob(os.path.join(directory, '**', pattern), recursive=True))
    
    resolved_files = []
    
    for file_path in files_to_check:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if file has conflict markers
            if '<<<<<<< HEAD' in content:
                print(f"Resolving conflicts in: {file_path}")
                
                # Replace conflict blocks with HEAD version
                def replace_conflict(match):
                    head_content = match.group(1)
                    return head_content
                
                resolved_content = conflict_pattern.sub(replace_conflict, content)
                
                # Write back the resolved content
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(resolved_content)
                
                resolved_files.append(file_path)
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return resolved_files

if __name__ == "__main__":
    current_dir = os.getcwd()
    print(f"Resolving merge conflicts in: {current_dir}")
    
    resolved = resolve_merge_conflicts(current_dir)
    
    if resolved:
        print(f"\nResolved conflicts in {len(resolved)} files:")
        for file_path in resolved:
            print(f"  - {file_path}")
        print("\nRun 'git add .' and 'git commit' to save the changes.")
    else:
        print("No merge conflicts found.")