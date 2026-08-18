import hashlib
import hmac
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Header, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
DB_PATH = os.getenv('DB_PATH', '/workspace/data/app.db')
DIST_PATH = '/workspace/dist'
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', '')
SESSION_SECRET = os.getenv('ADMIN_SESSION_SECRET', '')
SESSION_TTL_MINUTES = 60 * 12
def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
def ensure_column(conn, column: str):
    columns = {row['name'] for row in conn.execute('PRAGMA table_info(invitation)').fetchall()}
    if column not in columns:
        conn.execute(f"ALTER TABLE invitation ADD COLUMN {column} TEXT NOT NULL DEFAULT ''")
def init_db():
    with get_db() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS invitation (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            parents TEXT NOT NULL, groom TEXT NOT NULL, bride TEXT NOT NULL,
            wedding_date TEXT NOT NULL, venue TEXT NOT NULL, address TEXT NOT NULL,
            guide_text TEXT NOT NULL,
            parent_account TEXT NOT NULL DEFAULT '',
            bride_parent_account TEXT NOT NULL DEFAULT '',
            groom_account TEXT NOT NULL DEFAULT '',
            bride_account TEXT NOT NULL DEFAULT '',
            photo_url TEXT NOT NULL DEFAULT ''
        )''')
        for column in ('parent_account', 'bride_parent_account', 'groom_account', 'bride_account', 'photo_url'):
            ensure_column(conn, column)
        conn.execute('''CREATE TABLE IF NOT EXISTS guestbook (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, message TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )''')
        existing = conn.execute('SELECT id FROM invitation WHERE id=1').fetchone()
        if not existing:
            conn.execute('''INSERT INTO invitation (
                id, parents, groom, bride, wedding_date, venue, address, guide_text,
                parent_account, bride_parent_account, groom_account, bride_account, photo_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', (
                1, '한홍섭, 이경순의 아들 재호\n(故)강보순, 박인순의 딸 지희',
                '한재호', '강지희', '2026-11-21T00:00', '제이하우스',
                '경기도 평택시 만세로 1627-35(청룡동 397-36)',
                '평택역에서 소사벌 방면 시내버스 1108, 1183번 탑승 후 청룡동 입구 하차',
                '새마을금고 9003-2757-4296-6 한홍섭',
                '농협 521013-52-211301 박인순',
                '농협 352-0895-2912-63 한재호',
                '농협 537-02-195145 강지희'
            ))
def auth_error():
    raise HTTPException(status_code=401, detail='관리자 인증이 필요하거나 만료되었어요.')
def create_session_token():
    expires = int((datetime.now(timezone.utc) + timedelta(minutes=SESSION_TTL_MINUTES)).timestamp())
    nonce = secrets.token_urlsafe(18)
    message = f'{expires}.{nonce}'
    signature = hmac.new(SESSION_SECRET.encode(), message.encode(), hashlib.sha256).hexdigest()
    return f'{message}.{signature}', expires
def verify_session_token(token: str | None):
    if not SESSION_SECRET or not token:
        return False
    try:
        expires_text, nonce, signature = token.split('.', 2)
        message = f'{expires_text}.{nonce}'
        expected = hmac.new(SESSION_SECRET.encode(), message.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(signature, expected) and int(expires_text) > int(datetime.now(timezone.utc).timestamp())
    except (ValueError, TypeError):
        return False
class InvitationInput(BaseModel):
    parents: str
    groom: str
    bride: str
    wedding_date: str
    venue: str
    address: str
    guide_text: str
    parent_account: str
    bride_parent_account: str
    groom_account: str
    bride_account: str
    photo_url: str = ''
class GuestbookInput(BaseModel):
    name: str
    message: str
class AdminLoginInput(BaseModel):
    password: str
app = FastAPI()
init_db()
@app.get('/api/health')
def health():
    return {'ok': True}
@app.post('/api/admin/login')
def admin_login(payload: AdminLoginInput):
    if not ADMIN_PASSWORD or not SESSION_SECRET:
        raise HTTPException(status_code=503, detail='관리자 보안 설정이 아직 완료되지 않았어요.')
    if not hmac.compare_digest(payload.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail='비밀번호가 올바르지 않아요.')
    token, expires = create_session_token()
    return {'token': token, 'expires_at': expires}
@app.get('/api/invitation')
def get_invitation():
    with get_db() as conn:
        row = conn.execute('SELECT * FROM invitation WHERE id=1').fetchone()
    return dict(row)
@app.put('/api/invitation')
def update_invitation(payload: InvitationInput, x_admin_token: str | None = Header(default=None)):
    if not verify_session_token(x_admin_token):
        auth_error()
    values = [
        payload.parents.strip(), payload.groom.strip(), payload.bride.strip(), payload.wedding_date,
        payload.venue.strip(), payload.address.strip(), payload.guide_text.strip(),
        payload.parent_account.strip(), payload.bride_parent_account.strip(), payload.groom_account.strip(), payload.bride_account.strip()
    ]
    photo_url = payload.photo_url.strip()
    if not all(values):
        raise HTTPException(status_code=400, detail='모든 항목을 입력해 주세요.')
    with get_db() as conn:
        conn.execute('''UPDATE invitation SET
            parents=?, groom=?, bride=?, wedding_date=?, venue=?, address=?, guide_text=?,
            parent_account=?, bride_parent_account=?, groom_account=?, bride_account=?, photo_url=? WHERE id=1''', [*values, photo_url])
        row = conn.execute('SELECT * FROM invitation WHERE id=1').fetchone()
    return dict(row)
@app.get('/api/guestbook')
def get_guestbook():
    with get_db() as conn:
        rows = conn.execute('SELECT * FROM guestbook ORDER BY id DESC').fetchall()
    return [dict(row) for row in rows]
@app.post('/api/guestbook')
def add_guestbook(payload: GuestbookInput):
    name, message = payload.name.strip(), payload.message.strip()
    if not name or not message:
        raise HTTPException(status_code=400, detail='이름과 메시지를 모두 입력해 주세요.')
    with get_db() as conn:
        cursor = conn.execute('INSERT INTO guestbook (name, message) VALUES (?, ?)', (name, message))
        row = conn.execute('SELECT * FROM guestbook WHERE id=?', (cursor.lastrowid,)).fetchone()
    return dict(row)
@app.delete('/api/guestbook/{entry_id}')
def delete_guestbook(entry_id: int, x_admin_token: str | None = Header(default=None)):
    if not verify_session_token(x_admin_token):
        auth_error()
    with get_db() as conn:
        cursor = conn.execute('DELETE FROM guestbook WHERE id=?', (entry_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail='방명록을 찾지 못했어요.')
    return {'ok': True}
if os.path.isdir(DIST_PATH):
    app.mount('/', StaticFiles(directory=DIST_PATH, html=True), name='frontend')
