import os
import re

def clean_filename(filename):
    # Remove file extension
    base_name = os.path.splitext(filename)[0]
    extension = os.path.splitext(filename)[1]
    
    # Convert to lowercase
    base_name = base_name.lower()
    
    # Replace spaces and special characters with hyphens
    base_name = re.sub(r'[^a-z0-9-]', '-', base_name)
    
    # Replace multiple consecutive hyphens with a single hyphen
    base_name = re.sub(r'-+', '-', base_name)
    
    # Remove leading and trailing hyphens
    base_name = base_name.strip('-')
    
    return base_name + extension

def rename_files_in_directory(directory):
    # Ensure the directory exists
    if not os.path.exists(directory):
        print(f"Directory {directory} does not exist")
        return
    
    # Get all files in the directory
    for filename in os.listdir(directory):
        if os.path.isfile(os.path.join(directory, filename)):
            new_filename = clean_filename(filename)
            
            # Create full file paths
            old_filepath = os.path.join(directory, filename)
            new_filepath = os.path.join(directory, new_filename)
            
            # Rename the file
            if old_filepath != new_filepath:
                try:
                    os.rename(old_filepath, new_filepath)
                    print(f"Renamed: {filename} -> {new_filename}")
                except Exception as e:
                    print(f"Error renaming {filename}: {str(e)}")

# Run the script
jobs_directory = "jobs"  # Update this path if your jobs folder is elsewhere
rename_files_in_directory(jobs_directory)
