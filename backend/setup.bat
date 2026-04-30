@echo off
echo Setting up LMS Project...
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
echo Done! Run: python manage.py runserver
