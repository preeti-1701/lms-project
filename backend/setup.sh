#!/bin/bash
echo "Setting up LMS Project..."
pip install -r requirements.txt
python manage.py migrate
echo ""
echo "Creating admin user..."
python manage.py createsuperuser
echo ""
echo "Done! Start server with: python manage.py runserver"
