# TODO

## Phase 1: Reset broken migrations + database
- [x] Delete db.sqlite3
- [x] Delete all migrations except `__init__.py`
- [x] Run `python backend/manage.py makemigrations`
- [x] Run `python backend/manage.py migrate`
- [x] Verify with `python backend/manage.py showmigrations`

## Phase 2: Custom user model decision
- [ ] Update `core/models.py` to switch from `AbstractUser` to `AbstractBaseUser` + `PermissionsMixin`
- [ ] Add `UserManager` methods required for auth (create_user/create_superuser)
- [ ] Update fields/metadata: email as `USERNAME_FIELD`, remove username
- [ ] Update `backend/core/admin.py` to use correct admin class for custom user
- [ ] Update any auth logic in `core/views.py` / serializers that depends on `authenticate(email=...)`
- [ ] Generate new migrations and run `python backend/manage.py migrate`
- [ ] Run a quick smoke test: create user via API/login flow

