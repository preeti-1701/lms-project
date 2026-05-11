# Django Backend

## Setup

1. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

## Run the Django Server

Start the local development server with:
```bash
python manage.py runserver
```

Then open `http://127.0.0.1:8000/` in your browser.

## Notes

- If you change the server port, use `python manage.py runserver 0.0.0.0:8000` to bind to all interfaces.
- Ensure your virtual environment is active when running management commands.
