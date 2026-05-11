import os
import shutil

BASE_DIR = os.getcwd()

def fix_templates():
    print("\nFixing template structure...\n")

    for root, dirs, files in os.walk(BASE_DIR):
        for d in dirs:
            if d == "Templates":
                old_path = os.path.join(root, d)
                new_path = os.path.join(root, "templates")
                print(f"Renaming: {old_path} -> {new_path}")
                os.rename(old_path, new_path)

    wrong_path = os.path.join(BASE_DIR, "courses", "courses", "templates", "video_player.html")
    correct_dir = os.path.join(BASE_DIR, "courses", "templates")
    correct_path = os.path.join(correct_dir, "video_player.html")

    if os.path.exists(wrong_path):
        print("Moving video_player.html to correct folder")
        os.makedirs(correct_dir, exist_ok=True)
        shutil.move(wrong_path, correct_path)

    print("\nDone fixing templates!\n")

def clean_pycache():
    for root, dirs, files in os.walk(BASE_DIR):
        for d in dirs:
            if d == "__pycache__":
                shutil.rmtree(os.path.join(root, d))

if __name__ == "__main__":
    fix_templates()
    clean_pycache()
    print("All fixes applied!")