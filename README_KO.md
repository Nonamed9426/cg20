# CG20 Steam Insight 프론트엔드 v2

회사 로고와 보라/핑크 네온 톤 UI 시안을 반영한 **Next.js + TypeScript + Tailwind CSS** 프론트엔드 프로젝트입니다.

## 들어있는 페이지
- `/` : 메인 페이지
- `/predict/[slug]` : 할인 예측 페이지
- `/games/[slug]` : 게임 상세 페이지
- `/rankings` : 게임 순위 페이지
- `/search` : 검색 페이지
- `/recommend` : 추천 페이지

## 현재 구현된 기능
- 날짜 기준으로 **하루 1개 오늘의 추천 게임** 자동 변경
- 메인 페이지에서 할인예측, 게임상세, 순위, 추천 흐름 연결
- 할인예측 페이지에 **캘린더 UI + 예상 할인 날짜** 표시
- 상세 페이지에 **가격/환율/추천 이유/뉴스/유사 게임** 표시
- 순위 페이지에 **국내 / 미국 / 스트리머 / best-worst 탭**
- 검색/추천 페이지 기본 동작
- 회사 로고 적용: `public/company-logo.jpg`

## 중요한 점
지금 버전은 **목데이터 기반 프론트엔드**입니다.
실제 Steam API, 환율 API, 백엔드 DB가 붙어 있지 않아서 데이터는 `lib/data.ts`에서 관리합니다.

나중에 백엔드 연결 시 아래 파일을 주로 수정하면 됩니다.
- `lib/data.ts`
- 각 페이지의 데이터 로딩 부분

---

# 1. Rocky Linux VM에 올리기

## 1-1. ZIP 업로드
로컬 PC에서 이 프로젝트 ZIP 파일을 VM으로 업로드합니다.
업로드 위치는 보통 `~` 또는 `/root` 아래가 편합니다.

예시:
- `/root/steam-insight-ui-rocky-v2.zip`
- `/home/계정명/steam-insight-ui-rocky-v2.zip`

## 1-2. 압축 해제
```bash
cd ~
unzip steam-insight-ui-rocky-v2.zip
cd steam-insight-ui-v2
```

압축 이름이 다르면 실제 파일명에 맞게 바꾸면 됩니다.

---

# 2. Node.js 설치

```bash
sudo dnf update -y
sudo dnf install -y curl git unzip tar
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

확인:
```bash
node -v
npm -v
```

---

# 3. 프로젝트 실행

## 3-1. 패키지 설치
```bash
cd ~/steam-insight-ui-v2
npm install
```

## 3-2. 개발 서버 실행
```bash
npm run dev
```

이 프로젝트는 package.json에 이미 아래처럼 들어있습니다.
- `0.0.0.0:3000` 으로 실행

즉, 따로 옵션을 안 붙여도 됩니다.

---

# 4. 3000번 포트 열기

```bash
sudo systemctl enable --now firewalld
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

결과에 `3000/tcp` 가 보이면 성공입니다.

---

# 5. 접속 주소

## VM 내부 브라우저
```text
http://localhost:3000
```

## 같은 네트워크 다른 PC
```text
http://VM_IP:3000
```

예:
```text
http://192.168.0.9:3000
```

주의:
- `http://0.0.0.0:3000` 은 브라우저에 입력하는 주소가 아님
- 반드시 `localhost` 또는 실제 IP 사용

---

# 6. 서버가 안 열릴 때 확인

## 6-1. 현재 위치 확인
`npm run dev` 는 **프로젝트 폴더 안에서만** 실행해야 합니다.

```bash
pwd
ls
```

여기서 `package.json` 이 보여야 정상입니다.

## 6-2. 3000 포트 확인
```bash
ss -tulnp | grep 3000
```

## 6-3. VM 내부에서 테스트
```bash
curl http://localhost:3000
```

HTML이 나오면 앱은 정상 실행 중입니다.

---

# 7. 프로덕션 실행

개발 서버 대신 배포 형태로 실행하려면:

```bash
npm install
npm run build
npm run start
```

이 경우에도 접속 포트는 3000입니다.

---

# 8. PM2로 백그라운드 실행

```bash
sudo npm install -g pm2
cd ~/steam-insight-ui-v2
npm install
npm run build
pm2 start npm --name steam-insight -- start
pm2 save
pm2 startup
```

상태 확인:
```bash
pm2 list
pm2 logs steam-insight
```

---

# 9. Nginx 연결

## 9-1. 설치
```bash
sudo dnf install -y nginx
sudo systemctl enable --now nginx
```

## 9-2. 설정 파일 생성
```bash
sudo tee /etc/nginx/conf.d/steam-insight.conf > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
```

## 9-3. 검사 후 재시작
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

이제 접속 주소:
```text
http://VM_IP
```

---

# 10. SELinux 이슈가 있을 때

Rocky Linux 에서 Nginx → 3000 프록시가 막히면:

```bash
sudo setsebool -P httpd_can_network_connect 1
sudo systemctl restart nginx
```

---

# 11. 바꾸기 쉬운 파일

## 로고 교체
- `public/company-logo.jpg`

## 메인페이지 레이아웃
- `components/home-page.tsx`

## 할인예측 페이지
- `components/predict-page.tsx`

## 게임 상세 페이지
- `components/detail-page.tsx`

## 게임 순위 페이지
- `components/ranking-board.tsx`

## 목데이터
- `lib/data.ts`

---

# 12. 추천 개발 순서
1. 프론트 화면 먼저 확인
2. 백엔드 API 스펙 확정
3. `lib/data.ts` 를 API fetch 방식으로 전환
4. 로그인/찜/알림 연결
5. 할인예측 알고리즘 연결

---

# 13. 실행 한 줄 요약

```bash
cd ~/steam-insight-ui-v2
npm install
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
npm run dev
```

브라우저:
```text
http://localhost:3000
또는
http://VM_IP:3000
```
